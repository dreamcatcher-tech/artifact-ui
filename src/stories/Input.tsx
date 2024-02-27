import { usePrompt } from '../react/hooks.ts'
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
  preload: string
  presubmit: boolean
  onTranscription: (arg0: boolean) => void
}
const Input: FC<InputProps> = ({ preload, presubmit, onTranscription }) => {
  const [error, setError] = useState()
  if (error) {
    throw error
  }

  const [value, setValue] = useState(preload || '')
  const [disabled, setDisabled] = useState(false)
  const [isTransReady, setIsTransReady] = useState(false)
  const { startRecording, stopRecording, recordingBlob, mediaRecorder } =
    useAudioRecorder()
  const start = useCallback(() => {
    startRecording()
    onTranscription && onTranscription(true)
    setDisabled(true)
  }, [startRecording, onTranscription])

  const prompt = usePrompt()
  const send = useCallback(() => {
    debug('send', value)
    setValue('')
    setDisabled(true)
    prompt(value)
      .catch(setError)
      .finally(() => setDisabled(false))
      .then((result) => debug('result', result?.content))
  }, [prompt, value])

  useEffect(() => {
    if (!recordingBlob) {
      return
    }
    const file = new File([recordingBlob], 'recording.webm', {
      type: recordingBlob.type,
    })
    // openai.audio.transcriptions
    //   .create({ file, model: 'whisper-1' })
    //   .then((transcription) => {
    //     setValue(transcription.text)
    //     setIsTransReady(true)
    //   })
    //   .catch(console.error)
    //   .finally(() => {
    //     onTranscription && onTranscription(false)
    //     setDisabled(false)
    //   })
  }, [recordingBlob, onTranscription])
  useEffect(() => {
    if (!isTransReady) {
      return
    }
    setIsTransReady(false)
    send()
  }, [isTransReady, send])

  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: '.txt',
  })
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
    const listener = (e) => {
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
    if (!doPreSubmit) {
      return
    }
    setDoPreSubmit(false) // Pass an argument to setDoPreSubmit
    send() // Remove the argument passed to the send function
  }, [doPreSubmit, send, value])

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
      placeholder={disabled ? undefined : 'Message DreamcatcherGPT...'}
      InputProps={inputProps}
      onChange={(e) => setValue(e.target.value)}
      disabled={disabled}
      onKeyDown={onKeyDown}
    />
  )
}

export default Input
