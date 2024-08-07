import { Agent, Thread } from '../api/web-client.types'
import { FC, useState } from 'react'
import './messages.css'
import CircularProgress from '@mui/material/CircularProgress'
import { green } from '@mui/material/colors'
import Chip from '@mui/material/Chip'
import Debug from 'debug'
import AgentIcon from '@mui/icons-material/SupportAgent'
import DaveIcon from '@mui/icons-material/SentimentDissatisfied'
import ToolIcon from '@mui/icons-material/Construction'
import GoalIcon from '@mui/icons-material/GpsFixed'
import SystemIcon from '@mui/icons-material/Settings'
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
import Tooltip from '@mui/material/Tooltip'
import { ToolAction } from './ToolAction.tsx'
import { assertString } from '@sindresorhus/is'
import Box from '@mui/material/Box'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { styled } from '@mui/material/styles'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import remarkGfm from 'remark-gfm'
import Markdown, { Components } from 'react-markdown'
import { Mermaid } from './Mermaid.tsx'

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}

const renderers: Partial<Components> = {
  code: ({ className, children, ...props }) => {
    const match = /language-(mermaid)/.exec(className || '')
    return match ? (
      <Mermaid chart={String(children).replace(/\n$/, '')} />
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const expandRemoved: IconButtonProps = { ...props }
  if ('expand' in expandRemoved) {
    delete expandRemoved.expand
  }
  return <IconButton {...expandRemoved} />
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}))

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
  type: 'user' | 'goalie' | 'runner' | 'system'
  path?: string
}
const ChatType: FC<ChatType> = ({ content, type, path }) => {
  const defaultExpanded = type === 'system' ? false : true
  const [expanded, setExpanded] = useState(defaultExpanded)

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot
          color={ChatColors[type]}
          sx={{ position: 'relative' }}
          onClick={handleExpandClick}
        >
          {chatIcons[type]}
          {!content && <Progress />}
        </TimelineDot>
        <TimelineConnector sx={{ bgcolor: ChatColors[type] + '.main' }} />
      </TimelineSeparator>
      <TimelineContent className='parent'>
        <Box
          sx={{ display: 'flex', alignItems: 'center' }}
          onClick={handleExpandClick}
        >
          <Typography variant='h6' component='span' sx={{ width: 100 }}>
            {chatTitles[type] + '\u00A0' + (path ? path : '')}
          </Typography>
          <ExpandMore expand={expanded}>
            <ExpandMoreIcon />
          </ExpandMore>
        </Box>
        <Collapse in={expanded} timeout='auto'>
          <Markdown components={renderers} remarkPlugins={[remarkGfm]}>
            {content || ''}
          </Markdown>
        </Collapse>
      </TimelineContent>
    </TimelineItem>
  )
}
enum ChatColors {
  user = 'primary',
  goalie = 'warning',
  runner = 'secondary',
  system = 'error',
}
const chatTitles = {
  user: 'Dave',
  goalie: 'HAL',
  runner: 'HAL',
  system: 'Agent:',
}
const chatIcons = {
  user: <DaveIcon />,
  goalie: <GoalIcon />,
  runner: <ToolIcon />,
  system: <SystemIcon />,
}

interface Chat {
  content: string
  path?: string
}
const Dave: FC<Chat> = ({ content }) => (
  <ChatType content={content} type='user' />
)
const Assistant: FC<Chat> = ({ content }) => (
  <ChatType content={content} type='goalie' />
)
const System: FC<Chat> = ({ content, path }) => (
  <ChatType content={content} type='system' path={path} />
)
interface AgentPanel {
  agent: Agent
}
const AgentPanel: FC<AgentPanel> = ({ agent }) => {
  const status = STATUS.RUNNING
  const { description, commands, instructions } = agent
  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot color='warning' sx={{ position: 'relative' }}>
          <AgentIcon />
          {status !== STATUS.DONE && <Progress />}
        </TimelineDot>
      </TimelineSeparator>
      <TimelineContent>
        <Typography variant='h6' component='span' sx={{ mr: 1 }}>
          HAL
        </Typography>
        <Tooltip title='Goal' arrow placement='left'>
          <Alert icon={<AgentIcon fontSize='small' />} severity='info'>
            {description}
          </Alert>
        </Tooltip>
        <Card sx={{ m: 1 }}>
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
                    <Markdown
                      components={renderers}
                      remarkPlugins={[remarkGfm]}
                    >
                      {instructions}
                    </Markdown>
                  }
                />
              </ListItem>
            </Tooltip>
          </List>
        </Card>
      </TimelineContent>
    </TimelineItem>
  )
}
const Tool: FC<ToolAction> = ({ tool_calls, messages }) => (
  <TimelineItem>
    <TimelineSeparator>
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
  thread?: Thread
}
const Messages: FC<Messages> = ({ thread }) => {
  const path = thread?.agent.name
  const messages = thread?.messages || []
  if (!messages.length) {
    return null
  }
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
              if (!content) {
                console.error('empty content:', message)
              }
              return <Assistant key={key} content={content || ''} />
            }
          case 'system':
            // TODO display the entire Agent
            return <System key={key} content={content} path={path} />
          case 'tool':
            return null
          default:
            throw new Error(`unknown type ${role}`)
        }
      })}
    </Timeline>
  )
}

export default Messages
