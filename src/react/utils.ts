import { EventSourceParserStream } from 'eventsource-parser/stream'

export const toEvents = (stream: ReadableStream) => {
  return stream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream())
}
