// this is supposed to have been copied over from the artifact project
import {
  Params,
  PierceRequest,
  AudioPierceRequest,
  Cradle,
  PID,
  DispatchFunctions,
  PROCTYPE,
} from '../constants.ts'

export default class API implements Cradle {
  constructor(private readonly url: string) {
    this.url = url
  }
  ping(params = {}) {
    return this.request('ping', params)
  }
  apiSchema(params: { isolate: string }) {
    return this.request('apiSchema', params)
  }
  pierce(params: PierceRequest) {
    return this.request('pierce', params)
  }
  async audioPierce(params: AudioPierceRequest) {
    // this is a special one that uses a blob arg
    const response = await fetch(`${this.url}/api/audioPierce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
    return await response.json()
  }
  logs(params: { repo: string }) {
    return this.request('logs', params)
  }
  async pierces(isolate: string, target: PID) {
    // cradle side, since functions cannot be returned from isolate calls
    const apiSchema = await this.apiSchema({ isolate })
    const pierces: DispatchFunctions = {}
    for (const functionName of Object.keys(apiSchema)) {
      pierces[functionName] = (
        params: Params = {},
        options?: { branch?: boolean }
      ) => {
        const proctype = options?.branch ? PROCTYPE.BRANCH : PROCTYPE.SERIAL
        const pierce: PierceRequest = {
          target,
          ulid: 'calculated-server-side',
          isolate,
          functionName,
          params,
          proctype,
        }
        return this.pierce(pierce)
      }
    }
    return pierces
  }
  private async request(path: string, params: Params) {
    const response = await fetch(`${this.url}/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    return await response.json()
  }
}
