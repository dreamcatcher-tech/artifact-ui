import Debug from 'debug'
import TurndownService from 'turndown'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import FileIcon from '@mui/icons-material/FileCopyOutlined'
import { useAudioRecorder } from 'react-audio-voice-recorder'
import { useFilePicker } from 'use-file-picker'
import { LiveAudioVisualizer } from 'react-audio-visualize'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { ThreeBoxProps } from './ThreeBox'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import MicIcon from '@mui/icons-material/Mic'
import Link from '@mui/icons-material/Link'
// import Terminal from '@mui/icons-material/Terminal'
import Image from '@mui/icons-material/Image'
import Attach from '@mui/icons-material/AttachFile'
import SendIcon from '@mui/icons-material/ArrowUpwardRounded'
import Text from '@mui/icons-material/TextSnippet'
import { Box } from '@mui/material'
import { ClickAwayListener } from '@mui/base/ClickAwayListener'
import { Thread } from '../constants'
// import StateboardIcon from '@mui/icons-material/Monitor'
// import MessageIcon from '@mui/icons-material/Forum'

const log = Debug('AI:Input')
const turndown = new TurndownService()

interface SendProps {
  send: (arg0: unknown) => void
}
const Send: FC<SendProps> = ({ send }) => (
  <IconButton onClick={send}>
    <SendIcon />
  </IconButton>
)

interface MicProps {
  onEvent: () => void
  disabled?: boolean
}
const Mic: FC<MicProps> = ({ onEvent, disabled }) => (
  <IconButton onClick={onEvent} disabled={disabled} data-testid='mic'>
    <MicIcon />
  </IconButton>
)

const AttachMenu: FC<{ disabled: boolean }> = ({ disabled }) => {
  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: '.txt',
  })
  log('filesContent', filesContent, loading)

  const [open, setOpen] = useState(false)
  const actions = []
  const onClick = () => {}
  actions.push(
    { icon: <FileIcon />, name: 'Files', onClick: openFilePicker },
    { icon: <Text />, name: 'Text', onClick },
    { icon: <Image />, name: 'Image', onClick },
    { icon: <Link />, name: 'Web Link', onClick }
  )

  return (
    <Box sx={{ position: 'relative', width: 40 }}>
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <SpeedDial
          open={open}
          onClick={() => setOpen(!open)}
          // onBlur={handleBlur}
          sx={{ position: 'absolute', top: -28, left: -5 }}
          ariaLabel='SpeedDial'
          icon={<SpeedDialIcon icon={<Attach fontSize='medium' />} />}
          FabProps={{
            size: 'small',
            color: 'default',
            disabled,
          }}
          direction='right'
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              onClick={() => {
                setOpen(false)
                action.onClick()
              }}
              tooltipTitle={action.name}
            />
          ))}
        </SpeedDial>
      </ClickAwayListener>
    </Box>
  )
}

export interface InputProps {
  prompt?: (content: string) => Promise<void>
  transcribe?: ThreeBoxProps['transcribe']
  onRecording?: (isRecording: boolean) => void
  preload?: string
  presubmit?: boolean
  thread?: Thread
}
const Input: FC<InputProps> = (props) => {
  const { prompt, transcribe, onRecording, preload, presubmit, thread } = props
  const [error, setError] = useState()
  if (error) {
    throw error
  }

  const [value, setValue] = useState(preload || '')
  const [disabled, setDisabled] = useState(false)
  const [placeholder, setPlaceholder] = useState('')
  const [isTransReady, setIsTransReady] = useState(false)
  const { startRecording, stopRecording, recordingBlob, mediaRecorder } =
    useAudioRecorder()
  const start = useCallback(() => {
    startRecording()
    if (onRecording) {
      onRecording(true)
    }
    setDisabled(true)
  }, [startRecording, onRecording])

  useEffect(() => {
    if (!prompt) {
      setDisabled(true)
      setPlaceholder('loading...')
    } else {
      setPlaceholder('Message DreamcatcherGPT...')
      setDisabled(false)
    }
  }, [prompt])
  const send = useCallback(() => {
    log('send', value)
    setValue('')
    setDisabled(true)
    if (typeof prompt !== 'function') {
      throw new Error('prompt is not defined')
    }
    prompt(value)
      .catch(setError)
      .finally(() => setDisabled(false))
  }, [prompt, value])

  useEffect(() => {
    if (!recordingBlob || !transcribe) {
      return
    }
    const file = new File([recordingBlob], 'recording.webm', {
      type: recordingBlob.type,
    })
    log('transcribe', file)
    let active = true
    setDisabled(true)
    transcribe(file)
      .then((text) => {
        if (!active) {
          return
        }
        setValue(text)
        setIsTransReady(true)
      })
      .catch(console.error)
      .finally(() => {
        if (!active) {
          return
        }
        if (onRecording) {
          onRecording(false)
        }
        setDisabled(false)
      })
    return () => {
      active = false
    }
  }, [transcribe, recordingBlob, onRecording])

  useEffect(() => {
    if (!isTransReady) {
      return
    }
    setIsTransReady(false)
  }, [isTransReady])

  // TODO fix why the component rerenders whenever things change
  const inputProps = {
    endAdornment: (
      <InputAdornment position='end'>
        {value ? (
          <Send send={send} />
        ) : (
          <>
            {mediaRecorder && (
              <LiveAudioVisualizer
                height={50}
                mediaRecorder={mediaRecorder}
                width={47}
                barWidth={15}
              />
            )}
            <Mic
              onEvent={mediaRecorder ? stopRecording : start}
              disabled={!transcribe || (!mediaRecorder && disabled)}
            />
          </>
        )}
      </InputAdornment>
    ),
    startAdornment: (
      <InputAdornment position='start'>
        <AttachMenu disabled={disabled} />
      </InputAdornment>
    ),
  }
  // TODO if a file is uploaded, store on fs, then sample it, then goal it

  // 0 = current, 1 = prior, -1 = escape has cleared the buffer
  const [upIndex, setUpIndex] = useState(0)
  const [tip, setTip] = useState('')

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isUnmodified = !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey
      if (e.key === 'Enter' && isUnmodified) {
        e.preventDefault()
        send()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        if (value && upIndex === 0) {
          setTip(value)
          setUpIndex(-1)
        } else {
          setTip('')
          setUpIndex(0)
        }
        setValue('')
      }
      if (isUnmodified) {
        log('e.key', e.key)
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          log('up upIndex', upIndex)
          if (upIndex === -1) {
            setValue(tip)
            setTip('')
            setUpIndex(0)
            return
          }
          if (upIndex === 0) {
            setTip(value)
          }
          if (!thread) {
            return
          }
          const message = getUserMessage(thread, upIndex + 1)
          if (message) {
            setValue(message)
            setUpIndex(upIndex + 1)
          }
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          log('down upIndex', upIndex)
          if (upIndex <= 0) {
            return
          }
          if (upIndex === 1) {
            setValue(tip)
            setTip('')
            setUpIndex(0)
          }
          if (!thread) {
            return
          }
          const message = getUserMessage(thread, upIndex - 1)
          if (message) {
            setValue(message)
            setUpIndex(upIndex - 1)
          }
        }
      }
    },
    [send, thread, upIndex, value, tip]
  )

  useEffect(() => {
    // TODO move these more global shortcuts to a global hook
    // hold ctrl + space to toggle recording
    const listener = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.ctrlKey) {
        if (disabled && !mediaRecorder) {
          return
        }
        e.preventDefault()
        setValue('')
        if (mediaRecorder) {
          stopRecording()
        } else {
          start()
        }
      }
      if (e.key.toLowerCase() === 'y' && e.ctrlKey) {
        e.preventDefault()
        // ctrl + y for a new tab / window without the hash
        // ctrl + shift + y to get a new session in the current window

        const urlWithoutHash = window.location.origin + window.location.pathname
        if (e.shiftKey) {
          // TODO do a backchat call to make a new thread, and don't allow
          // another one until this has finished
        } else {
          window.open(urlWithoutHash, '_blank', 'noopener')
        }
      }
    }
    globalThis.addEventListener('keydown', listener)
    return () => globalThis.removeEventListener('keydown', listener)
  }, [start, disabled, mediaRecorder, stopRecording, thread])

  const [doPreSubmit, setDoPreSubmit] = useState(presubmit)
  useEffect(() => {
    if (!prompt || !doPreSubmit) {
      return
    }
    setDoPreSubmit(false) // Pass an argument to setDoPreSubmit
    send() // Remove the argument passed to the send function
  }, [prompt, doPreSubmit, send, value])

  const ref = useRef<HTMLTextAreaElement>(null)
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault()
      const clipboardData = event.clipboardData
      const html = clipboardData.getData('text/html')
      let text = clipboardData.getData('text/plain')
      console.log('html', html)
      console.log('text', text)
      if (html) {
        text = turndown.turndown(html)
      }
      const textarea = ref.current
      if (!textarea) {
        console.error('textarea is not defined')
        return
      }
      const startPos = textarea.selectionStart
      const endPos = textarea.selectionEnd

      setValue(value.substring(0, startPos) + text + value.substring(endPos))
      setTimeout(() => {
        textarea.selectionStart = startPos
        textarea.selectionEnd = startPos + text.length
      })
    },
    [value]
  )
  const [hasFocus, setHasFocus] = useState(true)
  useEffect(() => {
    if (!disabled && hasFocus) {
      ref.current?.focus()
    }
  }, [disabled, hasFocus])

  return (
    <ClickAwayListener onClickAway={() => setHasFocus(false)}>
      <TextField
        autoFocus={true}
        inputRef={ref}
        value={disabled ? '' : value}
        multiline
        fullWidth
        variant='outlined'
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value)
          setUpIndex(0)
          setTip('')
        }}
        disabled={disabled}
        onKeyDown={onKeyDown}
        onPaste={handlePaste}
        slotProps={{
          input: inputProps,
        }}
      />
    </ClickAwayListener>
  )
}

export default Input

const getUserMessage = (thread: Thread, fromEnd: number) => {
  let index = thread.messages.length - 1
  let hitCount = 0
  while (index >= 0) {
    const message = thread.messages[index--]
    if (message.role === 'user') {
      // TODO handle prompts and selections being redone too
      if (typeof message.content === 'string') {
        hitCount++
        if (hitCount === fromEnd) {
          return message.content
        }
      }
    }
  }
  return ''
}
