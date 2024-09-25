import { MdEditor, ExposeParam } from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import { FC, useEffect, useRef } from 'react'
import { WidgetProps } from '../stories/Stateboard.tsx'
import { useState } from 'react'
// import fm from 'markdown-it-front-matter'

import Debug from 'debug'
const log = Debug('AI:Editor')

const MarkdownEditor: FC<WidgetProps> = ({ api }) => {
  log('Editor', api)
  const cwd = api.useWorkingDir()
  const file = api.useSelectedFile()
  const contents = api.useSelectedFileContents()
  log('file selection', file)
  log('cwd', cwd)

  useEffect(() => {
    if (typeof contents === 'string') {
      setText(contents)
    } else {
      setText(undefined)
    }
  }, [contents])

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

  if (!file) {
    return <div>nothing selected</div>
  }
  if (file.isDir) {
    return <div>Directory selected</div>
  }
  if (contents === null) {
    return <div>loading...</div>
  }
  if (contents === undefined) {
    return <div>no contents</div>
  }

  return (
    <MdEditor
      style={{ height: '100%' }}
      ref={ref}
      preview={false}
      modelValue={text || ''}
      onChange={setText}
      showCodeRowNumber={true}
      language='en-US'
      toolbarsExclude={['github', 'htmlPreview', 'pageFullscreen']}
      onSave={(editor) => {
        log('onSave', editor)
        alert('saving is not implemented')
      }}
    />
  )
}

export default MarkdownEditor
