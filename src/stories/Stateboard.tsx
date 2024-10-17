import useResizeObserver from 'use-resize-observer'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Debug from 'debug'
import { Backchat } from '../api/client-backchat.ts'
import { PID, Splice, type STATEBOARD_WIDGETS } from '../constants.ts'
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
import { useDeepState } from '../react/utils.ts'
import { TreeWatcher } from '../react/TreeWatcher.ts'

const log = Debug('AI:Stateboard')

export interface WidgetProps {
  api: StateboardApi
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

export interface StateboardApi {
  setFileSelections: (selection: FileData[]) => void
  setTextSelection: (selection: string | undefined) => void
  open: (file: FileData) => void
  openParent: () => void
  useWorkingDir: () => (FileData | null)[]
  useFilesList: () => (FileData | null)[]
  useFileSelections: () => FileData[]
  useSelectedFile: () => FileData | undefined
  useSelectedFileText: () => string | null | undefined
  useTextSelection: () => string | undefined
  useSelectedFileBinary: () => Uint8Array | null | undefined
  setPID: (pid: PID) => void
  usePID: () => PID | undefined
  useSplices: () => Splice[]
  expandCommits: (count: number) => void
  saveTextFile: (
    file: FileData,
    contents: string
  ) => Promise<{ charactersWritten: number }>
  setSelectedSplice: (splice: Splice) => void
  useSelectedSplice: () => Splice | undefined
}

const useApi = (backchat: Backchat, initialPid = backchat.pid) => {
  const [pid, setPID] = useDeepState<PID>(initialPid)
  const [fileSelections, setFileSelections] = useState<FileData[]>([])
  const [textSelection, setTextSelection] = useState<string | undefined>()
  const [textContents, setContents] = useState<string | null | undefined>()
  const [binary, setBinary] = useState<Uint8Array | null | undefined>()

  const [cwd, setCwd] = useState<(FileData | null)[]>([null])
  const [nextCwd, setNextCwd] = useState<(FileData | null)[]>(cwd)
  const [cwdFiles, setCwdFiles] = useState<(FileData | null)[]>([])
  const [latest, setLatest] = useState<Splice>()
  const [splices, setSplices] = useState<Splice[]>([])
  const [spliceDepth, setSpliceDepth] = useState(20)
  const [selectedSplice, setSelectedSplice] = useState<Splice>()
  // const [isLatestSelected, setIsLatestSelected] = useState(true)
  const isLatestSelected = true
  log('spliceDepth', spliceDepth)

  useEffect(() => {
    setPID(initialPid)
  }, [initialPid, setPID])

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
        setLatest((current) => {
          if (equal(current, splice)) {
            log('duplicate splice', splice)
            return current
          }
          return splice
        })
      }
    }
    watch()
    return () => {
      aborter.abort()
    }
  }, [backchat, pid])

  useEffect(() => {
    if (!latest || !isLatestSelected) {
      return
    }
    setSelectedSplice(latest)
  }, [latest, isLatestSelected])

  useEffect(() => {
    if (!selectedSplice) {
      return
    }
    log('begin cwd reconciliation', selectedSplice, nextCwd)

    const watcher = TreeWatcher.start(backchat, selectedSplice, nextCwd)
    watcher.drill().then((result) => {
      log('drill result', result)
      if (watcher.aborted) {
        return
      }
      const { cwd, files } = result
      setCwd(cwd)
      setCwdFiles(files)
    })
    return () => watcher.stop()
  }, [backchat, selectedSplice, nextCwd])

  const changeCwd = useCallback((nextCwd: (FileData | null)[]) => {
    setNextCwd(nextCwd)
    const temp = [...nextCwd]
    temp.pop()
    temp.push(null)
    setCwd(temp)
    setCwdFiles([null])
    setFileSelections([])
  }, [])

  const selectedFile: FileData = fileSelections[0]

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
      setBinary(undefined)
      return
    }
    if (!selectedSplice) {
      setContents(null)
      setBinary(null)
      return
    }
    let active = true
    log('selected file changed', selectedFilePath)
    // TODO BUT if the selected path is the same, then don't reload ?
    setContents(null)
    setBinary(null)

    const { pid, oid: commit } = selectedSplice

    // want to read using the oid of the object, if known
    // also want to do this for directories, as well

    // if the oid is unchanged, then don't set contents null
    // only if the oid changed, and we haven't loaded the new contents, then do
    // the loading

    backchat.readBinary(selectedFilePath, pid, commit).then((binary) => {
      if (!active) {
        return
      }
      console.log('loaded binary', binary)
      setBinary(binary)
      const string = new TextDecoder().decode(binary)
      setContents(string)
    })
    return () => {
      active = false
    }
  }, [selectedFilePath, selectedFileOid, selectedSplice, backchat])

  useEffect(() => {
    // when the head splice changes, change the commits
    if (!latest) {
      return
    }
    setSplices((current) => {
      return [latest, ...current]
    })
    if (isLatestSelected) {
      setSelectedSplice(latest)
    }

    // if select the head, then stay on the head, else lock on the commit
  }, [latest, isLatestSelected])

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
        // TODO see what we have in the cache first
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

  const api: StateboardApi = useMemo<StateboardApi>(
    () => ({
      setFileSelections(nextSelection) {
        if (equal(nextSelection, fileSelections)) {
          return
        }
        setFileSelections(nextSelection)
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
        return fileSelections
      },
      useFilesList: () => {
        return cwdFiles
      },
      useSelectedFile: () => {
        return selectedFile
      },
      useSelectedFileText: () => {
        return textContents
      },
      useSelectedFileBinary: () => {
        return binary
      },
      useTextSelection: () => {
        return textSelection
      },
      setPID: (next: PID) => {
        if (equal(next, pid)) {
          return
        }
        setPID(next)
        setLatest(undefined)
        setSplices([])
        setSelectedSplice(undefined)
      },
      usePID: () => {
        return pid
      },
      useSplices: () => {
        return splices
      },
      expandCommits: (count: number) => {
        if (count < 1) {
          throw new Error('count must be greater than 0')
        }
        setSpliceDepth((current) => {
          if (splices.length + count <= current) {
            return current
          }
          return current + count
        })
      },
      saveTextFile: async (file: FileData, contents: string) => {
        return saveFile(file, contents)
      },
      setSelectedSplice: (splice: Splice) => {
        setSelectedSplice((current) => {
          if (equal(current, splice)) {
            return current
          }
          return splice
        })
      },
      useSelectedSplice: () => {
        return selectedSplice
      },
    }),
    [
      binary,
      pid,
      fileSelections,
      cwd,
      cwdFiles,
      textContents,
      textSelection,
      splices,
      changeCwd,
      selectedFile,
      saveFile,
      selectedSplice,
      setSelectedSplice,
      setPID,
    ]
  )
  return api
}
