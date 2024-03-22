import { MessageParam } from '../constants.ts'
import { Help } from '../api/web-client.types'
import { FC } from 'react'
import './messages.css'
import CircularProgress from '@mui/material/CircularProgress'
import { green } from '@mui/material/colors'
import Chip from '@mui/material/Chip'
import Debug from 'debug'
import DaveIcon from '@mui/icons-material/SentimentDissatisfied'
import ToolIcon from '@mui/icons-material/Construction'
import GoalIcon from '@mui/icons-material/GpsFixed'
import Timeline from '@mui/lab/Timeline'
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Alert from '@mui/material/Alert'
import List from '@mui/material/List'
import Terminal from '@mui/icons-material/Terminal'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import DraftsIcon from '@mui/icons-material/Drafts'
import FolderIcon from '@mui/icons-material/Folder'
import RuleIcon from '@mui/icons-material/Rule'
import Tooltip from '@mui/material/Tooltip'
import { ToolAction } from './ToolAction'
import remarkGfm from 'remark-gfm'
import Markdown from 'react-markdown'
import { assertString } from '@sindresorhus/is'

const debug = Debug('AI:ThreeBox')
const STATUS = { RUNNING: 'RUNNING', DONE: 'DONE', ERROR: 'ERROR' }

const Progress = () => (
  <CircularProgress
    size={42}
    sx={{
      color: green[500],
      position: 'absolute',
      top: -5,
      left: -5,
      zIndex: 1,
    }}
  />
)

interface ChatType {
  content: string
  type: 'user' | 'goalie' | 'runner'
}
const ChatType: FC<ChatType> = ({ content, type }) => (
  <TimelineItem>
    <TimelineSeparator>
      <TimelineDot color={ChatColors[type]} sx={{ position: 'relative' }}>
        {chatIcons[type]}
        {!content && <Progress />}
      </TimelineDot>
    </TimelineSeparator>
    <TimelineContent className='parent'>
      <Typography variant='h6' component='span'>
        {ChatTitles[type]}
      </Typography>
      <br />
      <Markdown remarkPlugins={[remarkGfm]}>{content || ''}</Markdown>
    </TimelineContent>
  </TimelineItem>
)
enum ChatColors {
  user = 'primary',
  goalie = 'warning',
  runner = 'secondary',
}
enum ChatTitles {
  user = 'Dave',
  goalie = 'HAL',
  runner = 'HAL',
}
const chatIcons = {
  user: <DaveIcon />,
  goalie: <GoalIcon />,
  runner: <ToolIcon />,
}

interface Chat {
  content: string
}
const Dave: FC<Chat> = ({ content }) => (
  <ChatType content={content} type='user' />
)
const Assistant: FC<Chat> = ({ content }) => (
  <ChatType content={content} type='goalie' />
)
interface Goal {
  text: string
  status: string
  helps: Help[]
}
const Goal: FC<Goal> = ({ text, status, helps }) => {
  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot color='warning' sx={{ position: 'relative' }}>
          <GoalIcon />
          {status !== STATUS.DONE && <Progress />}
        </TimelineDot>
      </TimelineSeparator>
      <TimelineContent>
        <Typography variant='h6' component='span' sx={{ mr: 1 }}>
          HAL
        </Typography>
        <Tooltip title='Goal' arrow placement='left'>
          <Alert icon={<GoalIcon fontSize='small' />} severity='info'>
            {text}
          </Alert>
        </Tooltip>
        {helps.map(({ instructions, done, commands }, key) => (
          <Card sx={{ m: 1 }} key={key}>
            <List>
              <Tooltip title='Directory' arrow placement='left'>
                <ListItem dense>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <ListItemText primary={'TODO'} />
                </ListItem>
              </Tooltip>
              <Tooltip title='Commands' arrow placement='left'>
                <ListItem dense>
                  <ListItemIcon>
                    <Terminal />
                  </ListItemIcon>
                  <ListItemText
                    primary={commands?.map((cmd, key) => (
                      <Chip
                        label={cmd}
                        key={key}
                        color='primary'
                        variant='outlined'
                        sx={{ mr: 1, fontWeight: 'bold' }}
                      />
                    ))}
                  />
                </ListItem>
              </Tooltip>
              <Tooltip title='Instructions' arrow placement='left'>
                <ListItem dense>
                  <ListItemIcon>
                    <DraftsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {instructions.join('\n')}
                      </Markdown>
                    }
                  />
                </ListItem>
              </Tooltip>
              <Tooltip title='Checklist' arrow placement='left'>
                <ListItem dense>
                  <ListItemIcon>
                    <RuleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Markdown remarkPlugins={[remarkGfm]}>{done}</Markdown>
                    }
                  />
                </ListItem>
              </Tooltip>
            </List>
          </Card>
        ))}
      </TimelineContent>
    </TimelineItem>
  )
}
interface Tool {
  tool_calls: any[]
  messages: any[]
}
const Tool: FC<Tool> = ({ tool_calls, messages }) => (
  <TimelineItem>
    <TimelineSeparator>
      <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
      <TimelineDot color='secondary' sx={{ position: 'relative' }}>
        <ToolIcon />
      </TimelineDot>
      <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
    </TimelineSeparator>
    <TimelineContent>
      <ToolAction tool_calls={tool_calls} messages={messages} />
    </TimelineContent>
  </TimelineItem>
)

interface Messages {
  messages: MessageParam[]
  isTranscribing?: boolean
}
const Messages: FC<Messages> = ({ messages, isTranscribing = false }) => {
  return (
    <Timeline
      sx={{
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }}
    >
      {messages.map((message, key) => {
        const { role, content } = message
        debug('role', role, 'content', content)
        switch (role) {
          case 'user':
            assertString(content)
            return <Dave key={key} content={content} />
          case 'assistant':
            if (message.tool_calls) {
              return (
                <Tool
                  key={key}
                  tool_calls={message.tool_calls}
                  messages={messages}
                />
              )
            } else {
              assertString(content)
              return <Assistant key={key} content={content} />
            }
          case 'system':
            // TODO list the sysprompt, or the help file if it started from help
            return null
          case 'tool':
            return null
          default:
            throw new Error(`unknown type ${role}`)
        }
      })}
      {isTranscribing && <Dave content='(transcribing...)' />}
    </Timeline>
  )
}

export default Messages
