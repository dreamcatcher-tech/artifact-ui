import { FC } from 'react'
import Markdown from './Markdown.tsx'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Terminal from '@mui/icons-material/Terminal'
import { MessageParam } from '../constants.ts'
import Debug from 'debug'
// import { createTheme, ThemeProvider } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import { assertString } from '@sindresorhus/is'
import ReactJson from '@microlink/react-json-view'
import { Typography } from '@mui/material'

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
    const output = findOutput(messages, id)
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
          <Output output={output} />
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
  return null
}
const tryParse = (value: string) => {
  try {
    return JSON.parse(value)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return value === undefined ? null : value
    }
  }
}

const Output: FC<{ output: unknown }> = ({ output }) => {
  if (output !== null && typeof output === 'object') {
    return <ReactJson src={output} quotesOnKeys={false} name={false} />
  }
  if (output && typeof output === 'string') {
    return <Markdown content={output + ''} />
  }
  if (output === undefined) {
    output = 'undefined'
  }
  if (output === null) {
    output = 'null'
  }
  if (output === '') {
    output = '(empty)'
  }
  return (
    <Typography fontWeight='bold' fontStyle='italic'>
      {output + ''}
    </Typography>
  )
}
