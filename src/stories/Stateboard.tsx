import { FC, useEffect, useState } from 'react'
import Debug from 'debug'
import { Backchat } from '../api/client-backchat.ts'
import { Splice, TreeEntry, type STATEBOARD_WIDGETS } from '../constants.ts'
import FileExplorer from '../widgets/FileExplorer.tsx'
import Stack from '@mui/material/Stack'
import { useBackchat } from '../react/hooks.ts'
import { FileData } from '@aperturerobotics/chonky'

const log = Debug('AI:Stateboard')

export interface WidgetProps {
  api: api
}
type WidgetComponent = FC<WidgetProps>

type WidgetMap = {
  [key in STATEBOARD_WIDGETS]: WidgetComponent
}

const blank = (name: string) => () => <div>blank: {name}</div>

const map: WidgetMap = {
  FILE_EXPLORER: FileExplorer,
  BRANCH_EXPLORER: blank('BRANCH_EXPLORER'),
  COMMIT_GRAPH: blank('COMMIT_GRAPH'),
  COMMIT_INFO: blank('COMMIT_INFO'),
  THREADS: blank('THREADS'),
  REPOS: blank('REPOS'),
  TPS_REPORT: blank('TPS_REPORT'),
  MARKDOWN_EDITOR: blank('MARKDOWN_EDITOR'),
}

interface StateboardProps {
  widgets: STATEBOARD_WIDGETS[]
}

const Stateboard: FC<StateboardProps> = ({ widgets }) => {
  const backchat = useBackchat()
  const api = makeApi(backchat)
  return (
    <Stack sx={{ height: '100%' }}>
      {widgets.map((widget, key) => {
        const Component = map[widget]
        return <Component key={key} api={api} />
      })}
    </Stack>
  )
}

export default Stateboard

export interface api {
  setSelection: (selection: FileData[]) => void
  open: (file: FileData) => void
  openParent: () => void
  useWorkingDir: () => (FileData | null)[]
  useSelection: () => FileData[]
  useFile: (path: string) => FileData | null
  useFiles: () => FileData[]
}
const makeApi = (backchat: Backchat) => {
  const [selection, setSelection] = useState<FileData[]>([])
  const [cwd, setCwd] = useState<(FileData | null)[]>([null])
  const [nextCwd, setNextCwd] = useState<(FileData | null)[]>(cwd)
  const [files, setFiles] = useState<FileData[]>([])
  const [splice, setSplice] = useState<Splice>()

  useEffect(() => {
    if (!(backchat instanceof Backchat)) {
      mock(cwd, setFiles)
      log('MOCK root effect')
      return
    }
    log('root effect')
    const aborter = new AbortController()
    const watch = async () => {
      for await (const splice of backchat.watch(
        backchat.pid,
        undefined,
        undefined,
        aborter.signal
      )) {
        log('splice', splice)
        setSplice(splice)
      }
    }
    watch()
    return () => {
      aborter.abort()
    }
  }, [backchat])

  useEffect(() => {
    if (!splice) {
      return
    }
    log('begin cwd reconciliation', splice, nextCwd)
    const watcher = TreeWatcher.start(backchat, splice, nextCwd)
    watcher.drill().then((result) => {
      log('drill result', result)
      const { cwd, files } = result
      setCwd(cwd)
      setFiles(files)
    })
    return () => watcher.stop()
  }, [splice, nextCwd])

  const api: api = {
    setSelection(selection) {
      console.log('setSelection', selection)
      setSelection(selection)
    },
    open: (file: FileData) => {
      console.log('setOpen', file)
      if (file.isDir) {
        const search = cwd.lastIndexOf(file)
        if (search === -1) {
          setNextCwd([...cwd, file])
        } else {
          setNextCwd(cwd.slice(0, search + 1))
        }
      } else {
        console.log('open file', file)
      }
    },
    openParent: () => {
      console.log('openParent', cwd)
      setCwd(cwd.slice(0, cwd.length - 1))
    },
    useWorkingDir: () => {
      return cwd
    },
    useSelection: () => {
      return selection
    },
    useFiles: () => {
      return files
    },
    useFile: (path: string) => {
      return null
    },
  }
  return api
}
const mock = (
  cwd: (FileData | null)[],
  setFiles: (files: FileData[]) => void
) => {
  if (cwd.length <= 1) {
    setFiles([
      { id: 'lht', name: 'Projects', isDir: true },
      {
        id: 'mcd',
        name: 'chonky-sphere-v2.png',
        thumbnailUrl: 'https://chonky.io/chonky-sphere-v2.png',
      },
    ])
  } else {
    setFiles([{ id: 'lhtlht', name: 'Nested', ext: '' }])
  }
}

class TreeWatcher {
  #backchat: Backchat
  #cwd: (FileData | null)[]
  #splice: Splice
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
  stop() {
    this.#aborter.abort()
  }
  #aborter = new AbortController()
  async drill() {
    let path = '.'
    const promises = this.#cwd.map(async (item) => {
      if (item !== this.#cwd[0] && item !== null) {
        path += '/' + item.name
      }
      log('drill', path)
      try {
        const { pid, oid } = this.#splice
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
