import { MessageParam } from '../constants.ts'
import { Help } from '../api/web-client.types'
import { FC, useState } from 'react'
import './messages.css'
import CircularProgress from '@mui/material/CircularProgress'
import { green } from '@mui/material/colors'
import Chip from '@mui/material/Chip'
import Debug from 'debug'
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
import RuleIcon from '@mui/icons-material/Rule'
import Tooltip from '@mui/material/Tooltip'
import { ToolAction } from './ToolAction.tsx'
import remarkGfm from 'remark-gfm'
import Markdown from 'react-markdown'
import { assertString } from '@sindresorhus/is'
import Box from '@mui/material/Box'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { styled } from '@mui/material/styles'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'

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
}
const ChatType: FC<ChatType> = ({ content, type }) => {
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
      </TimelineSeparator>
      <TimelineContent className='parent'>
        <Box
          sx={{ display: 'flex', alignItems: 'center' }}
          onClick={handleExpandClick}
        >
          <Typography variant='h6' component='span' sx={{ width: 100 }}>
            {chatTitles[type]}
          </Typography>
          <ExpandMore expand={expanded}>
            <ExpandMoreIcon />
          </ExpandMore>
        </Box>
        <Collapse in={expanded} timeout='auto'>
          <Markdown remarkPlugins={[remarkGfm]}>{content || ''}</Markdown>
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
  system: 'SYSTEM',
}
const chatIcons = {
  user: <DaveIcon />,
  goalie: <GoalIcon />,
  runner: <ToolIcon />,
  system: <SystemIcon />,
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
const System: FC<Chat> = ({ content }) => (
  <ChatType content={content} type='system' />
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
                        {instructions}
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
const Tool: FC<ToolAction> = ({ tool_calls, messages }) => (
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
}
const Messages: FC<Messages> = ({ messages }) => {
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
            // TODO BUT this should be a help file, with front matter
            return <System key={key} content={content} />
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
