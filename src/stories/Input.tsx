import { useTranscribe, useGoalie, useHAL } from '../react/hooks.ts'
import { useAudioRecorder } from 'react-audio-voice-recorder'
import { useFilePicker } from 'use-file-picker'
import { LiveAudioVisualizer } from 'react-audio-visualize'
import { FC, useCallback, useEffect, useState } from 'react'
import Debug from 'debug'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import MicIcon from '@mui/icons-material/Mic'
import Attach from '@mui/icons-material/AttachFile'
import SendIcon from '@mui/icons-material/ArrowUpwardRounded'
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
  const sessionPid = useHAL()

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

  const prompt = useGoalie(sessionPid)
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
    if (!prompt) {
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
    transcribe(file)
      .then((text) => {
        setValue(text)
        setIsTransReady(true)
      })
      .catch(console.error)
      .finally(() => {
        onTranscribe && onTranscribe(false)
        setDisabled(false)
      })
  }, [transcribe, recordingBlob, onTranscribe])
  useEffect(() => {
    if (!isTransReady) {
      return
    }
    setIsTransReady(false)
    // send() // uncomment to auto send once transcription is received
  }, [isTransReady, send])

  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: '.txt',
  })
  debug('filesContent', filesContent, loading)
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
            <Mic onEvent={mediaRecorder ? stopRecording : start} />
          </>
        )}
      </InputAdornment>
    ),
    startAdornment: !disabled && (
      <InputAdornment position='start'>
        <IconButton onClick={openFilePicker}>
          <Attach fontSize='medium' />
        </IconButton>
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
  useEffect(() => {
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
      inputRef={(ref) => {
        if (!ref) {
          return
        }
        if (!disabled) {
          ref.focus()
        }
      }}
      value={disabled ? ' ' : value}
      multiline
      fullWidth
      variant='outlined'
      label='Input'
      placeholder={placeholder}
      InputProps={inputProps}
      onChange={(e) => setValue(e.target.value)}
      disabled={disabled}
      onKeyDown={onKeyDown}
    />
  )
}

export default Input
