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

/**
 * This is the real api, which is copied from the api project.
 *
 *
 * Testing this thing
 *
 * Ultimately this needs to get exported from the api project
 *
 * Fire up the api server on localhost and run tests against it.
 *
 * All the integration tests for Cradle should pass if this was dropped in to
 * those tests.
 *
 * Need to test with mock data in storybook,
 * then test, in storybook, with the real api server.
 * So if real api server is set in env, use that, otherwise use mock data.
 *
 * So the cradle comes from the provider hook.
 * Some of its functions will be used by the fetcher hook for swr.
 * Parts of storybook will
 *
 * Make a top level context for both swr and artifact together.
 * Then provide a mock artifact for ui testing.
 * Verify function calls and types in the steps of the play function
 */
