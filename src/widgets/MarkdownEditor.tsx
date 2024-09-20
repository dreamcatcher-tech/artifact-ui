import { MdEditor } from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import { FC } from 'react'
import { WidgetProps } from '../stories/Stateboard.tsx'
import { useState } from 'react'

import Debug from 'debug'
const log = Debug('AI:Editor')

const MarkdownEditor: FC<WidgetProps> = ({ api }) => {
  log('Editor', api)
  const cwd = api.useWorkingDir()
  const file = api.useSelectedFile()
  const contents = api.useSelectedFileContents()
  log('file selection', file)
  log('cwd', cwd)
  log('contents', contents)

  const [text, setText] = useState<string>()
  if (typeof contents === 'string' && contents !== text) {
    setText(contents)
  }

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
      preview={false}
      modelValue={text || ''}
      onChange={setText}
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
