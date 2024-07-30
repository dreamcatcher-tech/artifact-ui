import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import FileIcon from '@mui/icons-material/FileCopyOutlined'
import { useAudioRecorder } from 'react-audio-voice-recorder'
import { useFilePicker } from 'use-file-picker'
import { LiveAudioVisualizer } from 'react-audio-visualize'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import Debug from 'debug'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import MicIcon from '@mui/icons-material/Mic'
import Link from '@mui/icons-material/Link'
import Terminal from '@mui/icons-material/Terminal'
import Image from '@mui/icons-material/Image'
import Attach from '@mui/icons-material/AttachFile'
import SendIcon from '@mui/icons-material/ArrowUpwardRounded'
import Text from '@mui/icons-material/TextSnippet'
import { Box } from '@mui/material'
import { ClickAwayListener } from '@mui/base/ClickAwayListener'

const debug = Debug('AI:Input')

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

const AttachMenu: FC<{ disabled: boolean; handleBackchat?: () => void }> = ({
  disabled,
  handleBackchat,
}) => {
  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: '.txt',
  })
  debug('filesContent', filesContent, loading)
  // const speedDialRef = useRef(null)

  const [open, setOpen] = useState(false)
  const actions = []
  if (handleBackchat) {
    actions.push({
      icon: <Terminal />,
      name: 'Backchat',
      onClick: handleBackchat,
    })
  }
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
  prompt?: (text: string) => Promise<void>
  transcribe?: (audio: File) => Promise<string>
  onRecording?: (isRecording: boolean) => void
  handleBackchat?: () => void
  preload?: string
  presubmit?: boolean
}
const Input: FC<InputProps> = (props) => {
  const {
    prompt,
    transcribe,
    onRecording,
    handleBackchat,
    preload,
    presubmit,
  } = props
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
    onRecording && onRecording(true)
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
    debug('send', value)
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
    debug('transcribe', file)
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
        onRecording && onRecording(false)
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
              <LiveAudioVisualizer height={50} mediaRecorder={mediaRecorder} />
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
        <AttachMenu disabled={disabled} handleBackchat={handleBackchat} />
      </InputAdornment>
    ),
  }
  // TODO if a file is uploaded, store on fs, then sample it, then goal it

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isUnmodified = !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey
      if (e.key === 'Enter' && isUnmodified) {
        e.preventDefault()
        send()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setValue('')
      }
    },
    [send]
  )

  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
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
        const urlWithoutHash = window.location.href.split('#')[0]
        if (e.shiftKey) {
          window.location.assign(urlWithoutHash)
        } else {
          window.open(urlWithoutHash, '_blank')
        }
      }
    }
    globalThis.addEventListener('keydown', listener)
    return () => globalThis.removeEventListener('keydown', listener)
  }, [start, disabled, mediaRecorder, stopRecording])

  const [doPreSubmit, setDoPreSubmit] = useState(presubmit)
  useEffect(() => {
    if (!prompt || !doPreSubmit) {
      return
    }
    setDoPreSubmit(false) // Pass an argument to setDoPreSubmit
    send() // Remove the argument passed to the send function
  }, [prompt, doPreSubmit, send, value])

  return (
    <TextField
      inputRef={ref}
      value={disabled ? '' : value}
      multiline
      fullWidth
      variant='outlined'
      placeholder={placeholder}
      InputProps={inputProps}
      onChange={(e) => setValue(e.target.value)}
      disabled={disabled}
      onKeyDown={onKeyDown}
    />
  )
}

export default Input
