import { FC } from 'react'
import { WidgetProps } from '../stories/Stateboard.tsx'
// import { $getRoot, $getSelection } from 'lexical'
// import { useEffect } from 'react'

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'

import Debug from 'debug'
const log = Debug('AI:Editor')

function onError(error: Error) {
  console.error(error)
}

const Editor: FC<WidgetProps> = ({ api }) => {
  log('Editor', api)
  const initialConfig = {
    namespace: 'Editor',
    onError,
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<div>Enter some text...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <AutoFocusPlugin />
    </LexicalComposer>
  )
}

export default Editor
