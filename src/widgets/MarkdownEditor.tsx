import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import { MdEditor, ExposeParam, ToolbarNames } from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import { FC, useEffect, useRef } from 'react'
import { WidgetProps } from '../stories/Stateboard.tsx'
import { useState } from 'react'
// import fm from 'markdown-it-front-matter'

import Debug from 'debug'
import delay from 'delay'
import { ImageViewer } from './ImageViewer.tsx'
const log = Debug('AI:Editor')

const MarkdownEditor: FC<WidgetProps> = ({ api }) => {
  log('Editor', api)
  const cwd = api.useWorkingDir()
  const file = api.useSelectedFile()
  let contents = api.useSelectedFileText()
  if (file?.name.endsWith('.json') && typeof contents === 'string') {
    contents = '```json\n' + contents + '\n```'
  }
  log('file selection', file)
  log('cwd', cwd)

  useEffect(() => {
    if (typeof contents === 'string') {
      setText(contents)
    } else {
      setText(undefined)
    }
  }, [contents])
  const [isSaving, setIsSaving] = useState(false)
  const [text, setText] = useState<string>()
  if (typeof contents === 'string' && !text && contents !== text) {
    setText(contents)
  }
  const ref = useRef<ExposeParam>()

  useEffect(() => {
    const callback = () => {
      const selected = ref.current?.getSelectedText()
      api.setTextSelection(selected)
    }
    document.addEventListener('selectionchange', callback)
    return () => document.removeEventListener('selectionchange', callback)
  }, [api])

  useEffect(() => {
    let active = true
    if (!file?.name.endsWith('.json')) {
      return
    }
    const toggle = async () => {
      do {
        await delay(0)
        if (!active) {
          return
        }
      } while (!ref.current)
      log('togglePreviewOnly to true', file)
      ref.current.togglePreviewOnly(true)
    }
    toggle()

    return () => {
      active = false
    }
  }, [file])

  if (!file) {
    return <div>nothing selected</div>
  }
  if (file.isDir) {
    return <div>Directory selected</div>
  }

  if (file.name.endsWith('.jpg')) {
    return <ImageViewer api={api} />
  }
  if (contents === null) {
    return <div>loading...</div>
  }
  if (contents === undefined) {
    return <div>no contents</div>
  }

  // TODO externalize this library
  // TODO disable save if no changes
  // TODO make save go via the prompt
  // TODO handle contents changing server side during editing

  const toolbarsExclude: ToolbarNames[] = [
    'github',
    'htmlPreview',
    'pageFullscreen',
  ]
  if (file.name.endsWith('.json')) {
    toolbarsExclude.push('save')
  }

  log('typeof ', typeof contents)

  return (
    <>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={isSaving}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
      <MdEditor
        readOnly={file?.name.endsWith('.json')}
        style={{ height: '100%' }}
        ref={ref}
        preview={false}
        modelValue={text || ''}
        onChange={setText}
        showCodeRowNumber={true}
        autoDetectCode={true}
        autoFoldThreshold={1000}
        language='en-US'
        toolbarsExclude={toolbarsExclude}
        noUploadImg={true}
        onSave={(contents) => {
          log('onSave', contents)
          setIsSaving(true)
          api.saveTextFile(file, contents).finally(() => setIsSaving(false))
        }}
      />
    </>
  )
}

export default MarkdownEditor
