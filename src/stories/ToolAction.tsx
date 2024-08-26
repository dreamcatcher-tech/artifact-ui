import { FC, useMemo } from 'react'
import remarkGfm from 'remark-gfm'
import Markdown from 'react-markdown'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Terminal from '@mui/icons-material/Terminal'
import { MessageParam } from '../constants.ts'
import Debug from 'debug'
// import { createTheme, ThemeProvider } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import { assertString } from '@sindresorhus/is'
import ReactJson from '@microlink/react-json-view'

const debug = Debug('AI:ToolAction')

export interface ToolAction {
  tool_calls: { id: string; function: { name: string; arguments: string } }[]
  messages: MessageParam[]
}
export const ToolAction: FC<ToolAction> = ({ tool_calls, messages }) => {
  // const noDisabled = createTheme({ palette: { text: { disabled: '0 0 0' } }
  // })

  // need to get the isolate from the caller
  // then get the schema from the api
  // THEN somehow format the output or have a schema for it ?
  return tool_calls.map((tool_call, key) => {
    debug('tool_call', tool_call)
    const { id, function: func } = tool_call
    const { name, arguments: args } = func
    const data = tryParse(args)
    const output = useMemo(() => findOutput(messages, id), [messages, id])
    return (
      <Card key={key}>
        <CardHeader
          title={name}
          titleTypographyProps={{ variant: 'h6' }}
          avatar={<Terminal />}
        />
        <CardContent sx={{ pt: 0, pb: 0 }}>
          <ReactJson src={data} quotesOnKeys={false} name={false} />
        </CardContent>
        <CardHeader
          title='Output:'
          titleTypographyProps={{ variant: 'h6' }}
          avatar={<Terminal />}
        />
        <CardContent sx={{ pt: 0, pb: 0, fontFamily: 'sans-serif' }}>
          {typeof output === 'string' ? (
            <Markdown remarkPlugins={[remarkGfm]}>{output}</Markdown>
          ) : (
            <ReactJson src={output} quotesOnKeys={false} name={false} />
          )}
        </CardContent>
      </Card>
    )
  })
}
const findOutput = (messages: MessageParam[], id: string) => {
  const message = messages.find((message) => {
    if ('tool_call_id' in message) {
      return message.tool_call_id === id
    }
  })
  if (message) {
    if ('content' in message) {
      assertString(message.content)
      return tryParse(message.content)
    }
  }
}
const tryParse = (value: string) => {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}
