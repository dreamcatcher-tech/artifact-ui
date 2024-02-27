// copied from the artifact project
import { JSONSchemaType } from 'ajv'
export enum PROCTYPE {
  SERIAL = 'SERIAL',
  BRANCH = 'BRANCH',
}
export type { JSONSchemaType }

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | {
      [key: string]: JsonValue
    }
export type IsolateReturn = JsonValue | void

export type DispatchFunctions = {
  [key: string]: (
    params?: Params,
    options?: { branch?: boolean }
  ) => unknown | Promise<unknown>
}
export type Params = Record<string, unknown>

export type IsolateApiSchema = {
  [key: string]: JSONSchemaType<object>
}

export type Outcome = { result?: unknown; error?: Error }
export type IoStruct = {
  sequence: number
  requests: { [key: string]: Request }
  replies: { [key: string]: Outcome }
}
export const ENTRY_BRANCH = 'main'
/**
 * The Process Identifier used to address a specific process branch.
 */
export type PID = {
  account: string
  repository: string
  branches: string[]
}

export type HelpConfig = {
  model?: 'gpt-3.5-turbo-1106' | 'gpt-4-turbo-preview'
  temperature?: number
}
export type Help = {
  description?: string
  config?: HelpConfig
  runner?: string
  commands?: string[]
  instructions: string[]
  done?: string
  examples?: string[]
  tests?: string[]
}

export type PierceRequest = {
  target: PID
  ulid: string

  isolate: string
  functionName: string
  params: Params
  proctype: PROCTYPE
}
export type AudioPierceRequest = {
  target: PID
  ulid: string
  isolate: string
  functionName: string
  params: Params
  proctype: PROCTYPE
  audio: Blob
}
export interface Cradle {
  ping(params?: Params): Promise<IsolateReturn>
  apiSchema(params: { isolate: string }): Promise<Record<string, object>>
  pierce(params: PierceRequest): Promise<IsolateReturn>
  audioPierce(params: AudioPierceRequest): Promise<IsolateReturn>
  logs(params: { repo: string }): Promise<object[]>
}
