import Debug from 'debug'
import { Backchat } from '../api/client-backchat.ts'
import { Splice, TreeEntry } from '../constants.ts'
import { type FileData } from '@aperturerobotics/chonky'

const log = Debug('AI:TreeWatcher')

export class TreeWatcher {
  // TODO store the trees for each path so we can instantly display back
  // navigation
  // or just use a local cache so they are instantly available when backchat
  // calls, with caches named by the repo
  #backchat: Backchat
  #cwd: (FileData | null)[]
  #splice: Splice
  #aborter = new AbortController()
  static start(backchat: Backchat, splice: Splice, cwd: (FileData | null)[]) {
    if (cwd.length < 1) {
      throw new Error('cwd must have at least one item')
    }
    if (cwd[0] === null) {
      if (cwd.length > 1) {
        throw new Error('if root is null, cwd must have only one item')
      }
    }

    const watcher = new TreeWatcher(backchat, splice, cwd)
    return watcher
  }
  private constructor(
    backchat: Backchat,
    splice: Splice,
    cwd: (FileData | null)[]
  ) {
    this.#backchat = backchat
    this.#splice = splice
    this.#cwd = cwd
  }
  get aborted() {
    return this.#aborter.signal.aborted
  }
  stop() {
    this.#aborter.abort()
  }
  async drill() {
    let path = '.'
    const promises = this.#cwd.map(async (item) => {
      if (item !== this.#cwd[0] && item !== null) {
        path += '/' + item.name
      }
      log('drill', path)
      try {
        const { pid, oid } = this.#splice
        // TODO make this abortable
        // TODO use the oid in the filedata to heighten the cache hit rate
        return this.#backchat.readTree(path, pid, oid)
      } catch (err) {
        console.error('error reading tree', item, err)
      }
    })
    const trees = await Promise.all(promises)
    const resolved = []
    for (const tree of trees) {
      if (tree) {
        resolved.push(tree)
      } else {
        break
      }
    }
    log('resolved', resolved)

    const root = this.#splice.commit.tree
    const cwd: FileData[] = toCwd(root, this.#cwd, resolved)
    const files = toFiles(resolved[resolved.length - 1])
    return { cwd, files }
  }
}
// then do a second pass to deepen the data, like get the child count of each
// directory, file modification times, size of files

const toFiles = (tree: TreeEntry[]) => {
  const files: FileData[] = tree.map((entry) => {
    return {
      id: entry.oid,
      name: entry.path,
      isDir: entry.type === 'tree',
      isHidden: entry.path.startsWith('.'),
      ext: entry.type !== 'tree' ? entry.path.split('.').pop() : undefined,
    }
  })
  return files
}
const toCwd = (
  root: string,
  cwd: (FileData | null)[],
  trees: TreeEntry[][]
) => {
  const map: FileData[] = []
  let previous: TreeEntry[] | undefined
  cwd = [...cwd]
  for (const tree of trees) {
    const was = cwd.shift()
    if (was === undefined) {
      throw new Error('unexpected undefined')
    }
    const name = was === null ? ' ' : was.name
    const id = getId(root, previous, name)
    map.push({ id, name, isDir: true, isHidden: name.startsWith('.') })
    previous = tree
  }
  return map
}
const getId = (
  root: string,
  previous: TreeEntry[] | undefined,
  name: string
) => {
  if (!previous) {
    return root
  }
  const entry = previous.find((entry) => entry.path === name)
  if (!entry || entry.type !== 'tree') {
    throw new Error('expected tree entry: ' + name)
  }
  return entry.oid
}
