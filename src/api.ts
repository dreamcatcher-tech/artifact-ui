// this is supposed to have been copied over from the artifact project
import {
  Params,
  PierceRequest,
  AudioPierceRequest,
  Cradle,
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

  private async request(path: string, params: Params) {
    const response = await fetch(`${this.url}/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    return await response.json()
  }
}
