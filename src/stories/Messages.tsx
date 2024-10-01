import Slide from '@mui/material/Slide'
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom'
import { Agent, Thread } from '../api/types.ts'
import { FC, useMemo, useState } from 'react'
import './messages.css'
import CircularProgress from '@mui/material/CircularProgress'
import { green } from '@mui/material/colors'
import Chip from '@mui/material/Chip'
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
import Markdown from './Markdown.tsx'
import RouterIcon from '@mui/icons-material/AltRoute'
import { MessageParam } from '../constants.ts'
import KeyboardDownIcon from '@mui/icons-material/KeyboardArrowDown'

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
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
  name?: string
}
const ChatType: FC<ChatType> = ({ content, type, name }) => {
  const defaultExpanded = type === 'system' ? false : true
  const [expanded, setExpanded] = useState(defaultExpanded)

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }
  const title = (name ? name : chatTitles[type]).replace(' ', '\u00a0')
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
          <Typography variant='h6' component='span'>
            {title}
          </Typography>
          <ExpandMore expand={expanded}>
            <ExpandMoreIcon />
          </ExpandMore>
        </Box>
        <Collapse in={expanded} timeout={200}>
          <Markdown content={content || ''}></Markdown>
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
  goalie: '',
  runner: '',
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
  name?: string
}
const Dave: FC<Chat> = ({ content }) => (
  <ChatType content={content} type='user' />
)
const Assistant: FC<Chat> = ({ content, name }) => (
  <ChatType content={content} type='goalie' name={name} />
)
const System: FC<Chat> = ({ content }) => (
  <ChatType content={content} type='system' />
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
                <ListItemText primary={<Markdown content={instructions} />} />
              </ListItem>
            </Tooltip>
          </List>
        </Card>
      </TimelineContent>
    </TimelineItem>
  )
}

interface Tool extends ToolAction {
  name?: string
}
const Tool: FC<Tool> = ({ tool_calls, messages, name = '' }) => {
  if (isSwitch(tool_calls)) {
    return <Router tool_calls={tool_calls} messages={messages} name={name} />
  }
  return <ToolCall tool_calls={tool_calls} messages={messages} name={name} />
}
const ToolCall: FC<Tool> = ({ tool_calls, messages, name = '' }) => {
  const [expanded, setExpanded] = useState(false)

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }
  const title = name.replace(' ', '\u00a0')
  const isInProgress = useIsInProgress(messages, tool_calls)
  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot
          color='secondary'
          sx={{ position: 'relative' }}
          onClick={handleExpandClick}
        >
          <ToolIcon />
          {isInProgress && <Progress />}
        </TimelineDot>
        <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
      </TimelineSeparator>
      <TimelineContent className='parent'>
        <Box
          sx={{ display: 'flex', alignItems: 'center' }}
          onClick={handleExpandClick}
        >
          <Typography variant='h6' component='span'>
            {title}
          </Typography>
          <ExpandMore expand={expanded}>
            <ExpandMoreIcon />
          </ExpandMore>
        </Box>
        <Collapse in={expanded} timeout={200}>
          <ToolAction tool_calls={tool_calls} messages={messages} />
        </Collapse>
      </TimelineContent>
    </TimelineItem>
  )
}

const Router: FC<Tool> = ({ tool_calls, messages, name = '' }) => {
  const [expanded, setExpanded] = useState(false)

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }
  const title = name.replace(' ', '\u00a0')
  const isInProgress = useIsInProgress(messages, tool_calls)
  const switchPath = useSwitchPath(tool_calls)
  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot color='error' sx={{ position: 'relative' }}>
          <RouterIcon />
          {isInProgress && <Progress />}
        </TimelineDot>
        <TimelineConnector sx={{ bgcolor: 'secondary.main' }} />
      </TimelineSeparator>
      <TimelineContent>
        <Box
          sx={{ display: 'flex', alignItems: 'center' }}
          onClick={handleExpandClick}
        >
          <Typography variant='h6' component='span'>
            {title + ' ➡️ ' + switchPath}
          </Typography>
          <ExpandMore expand={expanded}>
            <ExpandMoreIcon />
          </ExpandMore>
        </Box>
        <Collapse in={expanded} timeout={200}>
          <ToolAction tool_calls={tool_calls} messages={messages} />
        </Collapse>
      </TimelineContent>
    </TimelineItem>
  )
}

interface Messages {
  thread?: Thread
}
const Messages: FC<Messages> = ({ thread }) => {
  const messages = thread?.messages || []

  if (!messages.length) {
    return null
  }
  return (
    <StickToBottom className='messages'>
      <StickToBottom.Content>
        <Timeline
          sx={{
            [`& .${timelineItemClasses.root}:before`]: {
              flex: 0,
              padding: 0,
            },
          }}
        >
          {messages.map((message, key) => {
            const { role, content = '' } = message
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
                      name={message.name}
                    />
                  )
                } else {
                  assertString(content)
                  return (
                    <Assistant
                      key={key}
                      content={content}
                      name={message.name}
                    />
                  )
                }
              case 'system':
                // TODO display the entire Agent
                assertString(content)
                return <System key={key} content={content} />
              case 'tool':
                return null
              default:
                throw new Error(`unknown type ${role}`)
            }
          })}
        </Timeline>
      </StickToBottom.Content>
      <ScrollToBottom />
    </StickToBottom>
  )
}

export default Messages

const useIsInProgress = (
  messages: MessageParam[],
  tool_calls: { id: string }[]
) => {
  return useMemo(() => {
    return !isCompleted(messages, tool_calls)
  }, [messages, tool_calls])
}
const isCompleted = (messages: MessageParam[], tool_calls: { id: string }[]) =>
  tool_calls.every(({ id }) =>
    messages.some((message) => {
      if ('tool_call_id' in message) {
        return message.tool_call_id === id && !!message.content
      }
    })
  )
const isSwitch = (tool_calls: { function: { name: string } }[]) => {
  return tool_calls[0].function.name === 'agents_switch'
}
const useSwitchPath = (tool_calls: { function: { arguments: string } }[]) => {
  return useMemo(() => {
    try {
      const args = JSON.parse(tool_calls[0].function.arguments)
      const path = args.path || ''
      return path.replace(' ', '\u00a0')
    } catch (error) {
      if (error instanceof SyntaxError) {
        return '(parse error...)'
      }
    }
  }, [tool_calls])
}

function ScrollToBottom() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext()

  return (
    <Slide direction='up' in={!isAtBottom} mountOnEnter unmountOnExit>
      <IconButton
        size='large'
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: '0',
          bgcolor: 'grey.300',
          color: 'common.white',
          '&:hover': {
            bgcolor: 'grey.800',
          },
        }}
        onClick={() => scrollToBottom()}
      >
        <KeyboardDownIcon />
      </IconButton>
    </Slide>
  )
}
