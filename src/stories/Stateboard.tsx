import useResizeObserver from 'use-resize-observer'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import equal from 'fast-deep-equal'

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
  selection?: FileData[]
}

const Stateboard: FC<StateboardProps> = ({ widgets, pid, selection }) => {
  const backchat = useBackchat()
  const api = useApi(backchat, pid)
  useEffect(() => {
    if (selection) {
      log('set selection from stateboard props', selection)
      api.setFileSelections(selection)
    }
  }, [selection, api])

  const [expanded, setExpanded] = useState<boolean[]>(widgets.map(() => true))

  const handleChange =
    (panelIndex: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded((prevExpanded) => {
        const newExpanded = [...prevExpanded]
        newExpanded[panelIndex] = isExpanded
        return newExpanded
      })
    }

  const expandedCount = expanded.filter(Boolean).length || 1
  const { ref, height = 1 } = useResizeObserver()
  const heightPerExpanded = (height - widgets.length * 48) / expandedCount

  if (!api) {
    return <div>loading stateboard...</div>
  }

  return (
    <Box
      ref={ref}
      sx={{
        backgroundColor: 'lightgoldenrodyellow',
        height: '100%',
        overflow: 'hidden',
        p: 1,
      }}
    >
      {widgets.map((widget, key) => {
        const Component = map[widget]
        return (
          <Accordion
            disableGutters
            key={key}
            expanded={expanded[key]}
            onChange={handleChange(key)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {widget}
            </AccordionSummary>
            <AccordionDetails
              sx={{
                overflow: 'hidden',
                height: expanded[key] ? heightPerExpanded : undefined,
                p: 0,
              }}
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
  setFileSelections: (selection: FileData[]) => void
  setTextSelection: (contents: string | undefined) => void
  open: (file: FileData) => void
  openParent: () => void
  useWorkingDir: () => (FileData | null)[]
  useFilesList: () => (FileData | null)[]
  useFileSelections: () => FileData[]
  useSelectedFile: () => FileData | undefined
  useSelectedFileContents: () => string | null | undefined
  useTextSelection: () => string | undefined
  usePID: () => PID | undefined
  useSplices: () => Splice[]
  expandCommits: (count: number) => void
  saveFile: (
    file: FileData,
    contents: string
  ) => Promise<{ charactersWritten: number }>
}
const useApi = (backchat: Backchat, pid?: PID) => {
  const [selection, setSelection] = useState<FileData[]>([])
  const [textSelection, setTextSelection] = useState<string | undefined>()
  const [cwd, setCwd] = useState<(FileData | null)[]>([null])
  const [nextCwd, setNextCwd] = useState<(FileData | null)[]>(cwd)
  const [files, setFiles] = useState<(FileData | null)[]>([])
  const [latest, setLatest] = useState<Splice>()
  const [splices, setSplices] = useState<Splice[]>([])
  const [spliceDepth, setSpliceDepth] = useState(20)

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
        setLatest(splice)
      }
    }
    watch()
    return () => {
      aborter.abort()
    }
  }, [backchat, pid])

  useEffect(() => {
    if (!latest) {
      return
    }
    log('begin cwd reconciliation', latest, nextCwd)

    const watcher = TreeWatcher.start(backchat, latest, nextCwd)
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
  }, [backchat, latest, nextCwd])

  const changeCwd = useCallback((nextCwd: (FileData | null)[]) => {
    setNextCwd(nextCwd)
    const temp = [...nextCwd]
    temp.pop()
    temp.push(null)
    setCwd(temp)
    setFiles([null])
    setSelection([])
  }, [])

  const [contents, setContents] = useState<string | null | undefined>()
  const selectedFile: FileData = selection[0]

  let selectedFilePath = undefined
  let selectedFileOid = undefined
  if (selectedFile && !selectedFile.isDir) {
    selectedFilePath =
      cwd.map((i) => i?.name).join('/') + '/' + selectedFile.name
    selectedFileOid = selectedFile.id
  }
  const saveFile = useCallback(
    (file: FileData, content: string) => {
      if (!latest) {
        throw new Error('no splice')
      }
      if (file.isDir) {
        throw new Error('cannot save directory')
      }
      const { pid } = latest
      const path = cwd.map((i) => i?.name).join('/') + '/' + file.name
      return backchat.write(path, content, pid)
    },
    [latest, cwd, backchat]
  )

  useEffect(() => {
    if (!selectedFilePath) {
      setContents(undefined)
      return
    }
    if (!latest) {
      setContents(null)
      return
    }
    let active = true
    log('selected file changed', selectedFilePath)
    setContents(null)

    const { pid, oid: commit } = latest

    // want to read using the oid of the object, if known
    // also want to do this for directories, as well

    // if the oid is unchanged, then don't set contents null
    // only if the oid changed, and we haven't loaded the new contents, then do
    // the loading

    backchat.read(selectedFilePath, pid, commit).then((contents) => {
      if (!active) {
        return
      }
      setContents(contents)
    })
    return () => {
      active = false
    }
  }, [selectedFilePath, selectedFileOid, latest, backchat])

  useEffect(() => {
    // when the head splice changes, change the commits
    if (!latest) {
      return
    }
    setSplices((current) => {
      return [latest, ...current]
    })

    // if select the head, then stay on the head, else lock on the commit
  }, [latest])

  const isMountedRef = useRef(true)
  const isSplicesFetching = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!splices.length) {
      return
    }
    let retries = 0

    const fetchSplices = async () => {
      try {
        isSplicesFetching.current = true

        const { pid, oid } = splices[splices.length - 1]
        const count = spliceDepth - splices.length
        const next = await backchat.splices(pid, { commit: oid, count })

        if (isMountedRef.current) {
          setSplices((prev) => [...prev, ...next])
        }
      } catch (error) {
        console.error('Error fetching commits:', error)

        if (isMountedRef.current) {
          if (retries >= 10) {
            throw new Error(`Failed to fetch commits after ${retries} attempts`)
          }
          retries++
          await fetchSplices()
        }
      } finally {
        isSplicesFetching.current = false
      }
    }

    if (!isSplicesFetching.current && splices.length < spliceDepth) {
      fetchSplices()
    }
  }, [splices, spliceDepth, backchat])

  const api: api = useMemo<api>(
    () => ({
      setFileSelections(nextSelection) {
        if (equal(nextSelection, selection)) {
          return
        }
        setSelection(nextSelection)
      },
      setTextSelection: (contents: string | undefined) => {
        log('setTextSelection', contents)
        setTextSelection(contents)
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
      useFileSelections: () => {
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
      useTextSelection: () => {
        return textSelection
      },
      usePID: () => {
        return latest?.pid || undefined
      },
      useSplices: () => {
        return splices
      },
      expandCommits: (count: number) => {
        if (count < 1) {
          throw new Error('count must be greater than 0')
        }
        setSpliceDepth((current) => current + count)
      },
      saveFile: async (file: FileData, contents: string) => {
        return saveFile(file, contents)
      },
    }),
    [
      selection,
      cwd,
      files,
      contents,
      textSelection,
      latest,
      splices,
      changeCwd,
      selectedFile,
      saveFile,
    ]
  )
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
