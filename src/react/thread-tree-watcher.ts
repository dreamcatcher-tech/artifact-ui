import equal from 'fast-deep-equal'
import Debug from 'debug'
import {
  Splice,
  Backchat,
  PID,
  getThreadPath,
  threadSchema,
  Thread,
} from '../api/types.ts'
const log = Debug('AI:threadTreeWatcher')

export interface RemoteTree {
  thread: Thread
  splice: Splice
  remote?: RemoteTree
}

interface OnChange {
  (changes: RemoteTree): void
}

export class ThreadTreeWatcher {
  #aborter = new AbortController()
  #remoteWatcher: ThreadTreeWatcher | undefined
  #target: PID
  #onChange: OnChange
  #backchat: Backchat
  #remote: RemoteTree | undefined
  #splice: Splice | undefined
  #patch: string | undefined
  #thread: Thread | undefined
  get #path() {
    return getThreadPath(this.#target)
  }

  static watch(backchat: Backchat, pid: PID, onChange: OnChange) {
    const watcher = new ThreadTreeWatcher(backchat, pid, onChange)
    return watcher
  }
  constructor(backchat: Backchat, target: PID, onChange: OnChange) {
    this.#backchat = backchat
    this.#target = target
    this.#onChange = onChange
    this.start()
  }
  stop() {
    this.#remoteWatcher?.stop()
    this.#aborter.abort()
  }
  isTarget(pid: PID) {
    return equal(pid, this.#target)
  }
  onChildChange(changes: RemoteTree) {
    this.#remote = changes
    this.#updateParent()
  }
  #updateParent() {
    if (!this.#splice) {
      throw new Error('no splice')
    }
    if (!this.#thread) {
      throw new Error('no thread')
    }
    if (this.#aborter.signal.aborted) {
      throw new Error('Watcher was aborted')
    }
    this.#onChange({
      splice: this.#splice,
      thread: this.#thread,
      remote: this.#remote,
    })
  }
  async start() {
    const after = undefined
    for await (const splice of this.#backchat.watch(
      this.#target,
      this.#path,
      after,
      this.#aborter.signal
    )) {
      log('splice', splice)
      if (this.#aborter.signal.aborted) {
        console.error('Watcher was aborted')
        return
      }
      this.update(splice)
    }
  }
  update(splice: Splice) {
    let changed = false
    if (!equal(this.#splice, splice)) {
      if (!equal(splice.pid, this.#target)) {
        throw new Error('pid mismatch')
      }
      this.#splice = { ...splice, pid: this.#target }
      changed = true
    }
    if (splice.changes) {
      if (splice.changes[this.#path]) {
        const { patch } = splice.changes[this.#path]
        if (patch && !equal(this.#patch, patch)) {
          this.#patch = patch
          this.thread(patch)
          changed = true
        }
      }
    }
    if (changed) {
      this.#updateParent()
    }
  }
  thread(patch: string) {
    const json = JSON.parse(patch)
    this.#thread = threadSchema.parse(json)

    const { remote } = this.#thread
    if (equal(remote, this.#target)) {
      throw new Error('remote is the same as target')
    }
    if (remote) {
      if (!this.#remoteWatcher?.isTarget(remote)) {
        this.#remoteWatcher?.stop()
        const onChange = (changes: RemoteTree) => this.onChildChange(changes)
        this.#remoteWatcher = ThreadTreeWatcher.watch(
          this.#backchat,
          remote,
          onChange
        )
      }
    } else {
      this.#remoteWatcher?.stop()
      this.#remoteWatcher = undefined
    }
  }
}
