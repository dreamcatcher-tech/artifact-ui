import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import FileIcon from '@mui/icons-material/FileCopyOutlined'
import { useTranscribe, useHAL } from '../react/hooks.ts'
import { useAudioRecorder } from 'react-audio-voice-recorder'
import { useFilePicker } from 'use-file-picker'
import { LiveAudioVisualizer } from 'react-audio-visualize'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
}
const Mic: FC<MicProps> = ({ onEvent }) => (
  <IconButton onClick={onEvent}>
    <MicIcon />
  </IconButton>
)

const AttachMenu: FC<{ disabled: boolean }> = ({ disabled }) => {
  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: '.txt',
  })
  debug('filesContent', filesContent, loading)

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const actions = [
    { icon: <FileIcon />, name: 'File(s)', onClick: openFilePicker },
    { icon: <Text />, name: 'Text', onClick: handleClose },
    { icon: <Image />, name: 'Image', onClick: handleClose },
    { icon: <Link />, name: 'Webpage', onClick: handleClose },
    { icon: <Terminal />, name: 'Backchat', onClick: handleClose },
  ]

  return (
    <Box sx={{ position: 'relative', width: 40 }}>
      <SpeedDial
        sx={{ position: 'absolute', top: -28, left: -5 }}
        ariaLabel='SpeedDial tooltip example'
        icon={<SpeedDialIcon icon={<Attach fontSize='medium' />} />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        FabProps={{ size: 'small', color: 'default', disabled }}
        direction='right'
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            onClick={() => {
              handleClose()
              action.onClick()
            }}
            tooltipTitle={action.name}
          />
        ))}
      </SpeedDial>
    </Box>
  )
}

interface InputProps {
  preload?: string
  presubmit?: boolean
  onTranscribe?: (isTranscribing: boolean) => void
}
const Input: FC<InputProps> = ({ preload, presubmit, onTranscribe }) => {
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
    onTranscribe && onTranscribe(true)
    setDisabled(true)
  }, [startRecording, onTranscribe])

  const { prompt } = useHAL()
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
    if (!value) {
      return
    }
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

  const transcribe = useTranscribe()
  useEffect(() => {
    if (!recordingBlob) {
      return
    }
    const file = new File([recordingBlob], 'recording.webm', {
      type: recordingBlob.type,
    })
    debug('transcribe', file)
    let active = true
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
        onTranscribe && onTranscribe(false)
        setDisabled(false)
      })
    return () => {
      active = false
    }
  }, [transcribe, recordingBlob, onTranscribe])

  useEffect(() => {
    if (!isTransReady) {
      return
    }
    setIsTransReady(false)
  }, [isTransReady])

  // TODO fix why the component rerenders whenever things change
  const inputProps = useMemo(
    () => ({
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
                />
              )}
              <Mic onEvent={mediaRecorder ? stopRecording : start} />
            </>
          )}
        </InputAdornment>
      ),
      startAdornment: (
        <InputAdornment position='start'>
          <AttachMenu disabled={disabled} />
        </InputAdornment>
      ),
    }),
    [send, mediaRecorder, stopRecording, start, disabled, value]
  )
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
      value={disabled ? ' ' : value}
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
