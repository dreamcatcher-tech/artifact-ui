import { FC, useCallback, useEffect, useState } from 'react'
import Debug from 'debug'
import { Backchat } from '../api/client-backchat.ts'
import {
  PID,
  Splice,
  TreeEntry,
  type STATEBOARD_WIDGETS,
} from '../constants.ts'
import FileExplorer from '../widgets/FileExplorer.tsx'
import CommitGraph from '../widgets/CommitGraph.tsx'
import MarkdownEditor from '../widgets/MarkdownEditor.tsx'
import Box from '@mui/material/Box'
import { useBackchat } from '../react/hooks.ts'
import { type FileData } from '@aperturerobotics/chonky'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useResizeDetector } from 'react-resize-detector'

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
  COMMIT_GRAPH: CommitGraph,
  MARKDOWN_EDITOR: MarkdownEditor,
  BRANCH_EXPLORER: blank('BRANCH_EXPLORER'),
  COMMIT_INFO: blank('COMMIT_INFO'),
  THREADS: blank('THREADS'),
  REPOS: blank('REPOS'),
  TPS_REPORT: blank('TPS_REPORT'),
}

interface StateboardProps {
  widgets: STATEBOARD_WIDGETS[]
  pid?: PID
}

const Stateboard: FC<StateboardProps> = ({ widgets, pid }) => {
  const backchat = useBackchat()
  const api = useApi(backchat, pid)
  const { width, height, ref } = useResizeDetector()
  log('resize', width, height)
  if (!api) {
    return <div>loading stateboard...</div>
  }
  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'hidden',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
      ref={ref}
    >
      {widgets.map((widget, key) => {
        const Component = map[widget]
        return (
          <Accordion key={key} disableGutters={false} defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {widget}
            </AccordionSummary>
            <AccordionDetails
              sx={{ height: 100 / widgets.length + 'vh', overflowY: 'auto' }}
            >
              <Component api={api} />
            </AccordionDetails>
          </Accordion>
        )
      })}
    </Box>
  )
}

export default Stateboard

export interface api {
  setSelection: (selection: FileData[]) => void
  open: (file: FileData) => void
  openParent: () => void
  useWorkingDir: () => (FileData | null)[]
  useFilesList: () => (FileData | null)[]
  useSelection: () => FileData[]
  useSelectedFile: () => FileData | undefined
  useSelectedFileContents: () => string | null | undefined
  usePID: () => PID | undefined
}
const useApi = (backchat: Backchat, pid?: PID) => {
  const [selection, setSelection] = useState<FileData[]>([])
  const [cwd, setCwd] = useState<(FileData | null)[]>([null])
  const [nextCwd, setNextCwd] = useState<(FileData | null)[]>(cwd)
  const [files, setFiles] = useState<(FileData | null)[]>([])
  const [splice, setSplice] = useState<Splice>()

  useEffect(() => {
    if (!(backchat instanceof Backchat)) {
      log('backchat not found')
      return
    }
    log('splice effect')
    const aborter = new AbortController()
    const watch = async () => {
      for await (const splice of backchat.watch(
        pid || backchat.pid,
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
  }, [backchat, pid])

  useEffect(() => {
    if (!splice) {
      return
    }
    log('begin cwd reconciliation', splice, nextCwd)

    const watcher = TreeWatcher.start(backchat, splice, nextCwd)
    watcher.drill().then((result) => {
      log('drill result', result)
      if (watcher.aborted) {
        return
      }
      const { cwd, files } = result
      setCwd(cwd)
      setFiles(files)
    })
    return () => watcher.stop()
  }, [backchat, splice, nextCwd])

  const changeCwd = useCallback((nextCwd: (FileData | null)[]) => {
    setNextCwd(nextCwd)
    const temp = [...nextCwd]
    temp.pop()
    temp.push(null)
    setCwd(temp)
    setFiles([null])
  }, [])

  const [contents, setContents] = useState<string | null | undefined>()
  const selectedFile: FileData = selection[0]

  let selectedFilePath = undefined
  if (selectedFile && !selectedFile.isDir) {
    selectedFilePath = ''

    selectedFilePath =
      cwd.map((item) => item?.name).join('/') + '/' + selectedFile.name
  }

  useEffect(() => {
    if (!selectedFilePath) {
      setContents(undefined)
      return
    }
    if (!splice) {
      return
    }
    let active = true
    log('selected file changed', selectedFilePath)
    setContents(null)
    const { pid, oid } = splice
    backchat.read(selectedFilePath, pid, oid).then((contents) => {
      if (!active) {
        return
      }
      setContents(contents)
    })
    return () => {
      active = false
    }
  }, [selectedFilePath, splice, backchat])

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
          changeCwd([...cwd, file])
        } else {
          changeCwd(cwd.slice(0, search + 1))
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
    useFilesList: () => {
      return files
    },
    useSelectedFile: () => {
      return selectedFile
    },
    useSelectedFileContents: () => {
      return contents
    },
    usePID: () => {
      return splice?.pid
    },
  }
  return api
}
// const mock = (
//   cwd: (FileData | null)[],
//   setFiles: (files: FileData[]) => void
// ) => {
//   if (cwd.length <= 1) {
//     setFiles([
//       { id: 'lht', name: 'Projects', isDir: true },
//       {
//         id: 'mcd',
//         name: 'chonky-sphere-v2.png',
//         thumbnailUrl: 'https://chonky.io/chonky-sphere-v2.png',
//       },
//     ])
//   } else {
//     setFiles([{ id: 'lhtlht', name: 'Nested', ext: '' }])
//   }
// }

// class GitWatcher {
//   // used to get the logs of a given branch ?
//   // somehow get the head commit of a given pid ?
//   // then get all the logs, in batches
// }

class TreeWatcher {
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
