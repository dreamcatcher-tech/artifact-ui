import { tryParse } from '../react/utils.ts'
import { FC } from 'react'
import Markdown from './Markdown.tsx'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Terminal from '@mui/icons-material/Terminal'
import { MessageParam } from '../constants.ts'
import Debug from 'debug'
import CardHeader from '@mui/material/CardHeader'
import { assertString } from '@sindresorhus/is'
import ReactJson from '@microlink/react-json-view'
import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'

const debug = Debug('AI:ToolAction')
const IN_PROGRESS = Symbol('IN_PROGRESS')

export interface ToolAction {
  tool_calls: { id: string; function: { name: string; arguments: string } }[]
  status: string[]
  messages: MessageParam[]
  index: number
}
export const ToolAction: FC<ToolAction> = ({
  tool_calls,
  status,
  messages,
  index,
}) => {
  return (
    <Stack spacing={1}>
      {tool_calls.map((tool_call, key) => {
        debug('tool_call', tool_call)
        const { id, function: func } = tool_call
        const { name, arguments: args } = func
        const data = tryParse(args)
        const output = findOutput(messages, id, index)
        return (
          <Card key={key}>
            <CardHeader
              title={name}
              titleTypographyProps={{ variant: 'h6' }}
              avatar={<Terminal />}
            />
            <CardContent sx={{ pt: 0, pb: 0 }}>
              <ReactJson
                src={data}
                quotesOnKeys={false}
                name={false}
                displayDataTypes={false}
                enableClipboard={false}
                indentWidth={2}
              />
            </CardContent>
            <CardHeader
              title={status[key] + ' Output:'}
              titleTypographyProps={{ variant: 'h6' }}
              avatar={<Terminal />}
            />
            <CardContent sx={{ pt: 0, pb: 0, fontFamily: 'sans-serif' }}>
              <Output output={output} />
            </CardContent>
          </Card>
        )
      })}
    </Stack>
  )
}
const findOutput = (messages: MessageParam[], id: string, index: number) => {
  let output: MessageParam | undefined
  for (; index < messages.length; index++) {
    const message = messages[index]
    if ('tool_call_id' in message) {
      if (message.tool_call_id === id) {
        output = message
        break
      }
    }
  }
  if (output) {
    assertString(output.content)
    return tryParse(output.content)
  }
  return IN_PROGRESS
}

const Output: FC<{ output: unknown }> = ({ output }) => {
  if (output !== null && typeof output === 'object') {
    return (
      <ReactJson
        src={output}
        quotesOnKeys={false}
        name={false}
        displayDataTypes={false}
        enableClipboard={false}
        indentWidth={2}
      />
    )
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
  if (output === IN_PROGRESS) {
    output = '(in progress...)'
  }
  return (
    <Typography fontWeight='bold' fontStyle='italic'>
      {output + ''}
    </Typography>
  )
}
