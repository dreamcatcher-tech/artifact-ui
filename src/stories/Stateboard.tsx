import { FC } from 'react'
import Debug from 'debug'
import { type STATEBOARD_WIDGETS } from '../constants.ts'
import FileExplorer from '../widgets/FileExplorer.tsx'
import Stack from '@mui/material/Stack'

const debug = Debug('AI:Stateboard')

export interface WidgetProps {
  api: unknown
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
  debug('Stateboard')
  // watch a specific file that indicates what to draw on the stateboard.
  // then interpret that file to look up other files
  // determine what is the type of the target given
  // look up our component maps and try to display it
  // default to json or plain text
  // if nothing there or loading, show a loading screen
  // if collection then show the table
  // if datum then show markdown text
  // if geometry show on a map

  return (
    <Stack>
      {widgets.map((widget, key) => {
        const Component = map[widget]
        return <Component key={key} api='' />
      })}
    </Stack>
  )
}

export default Stateboard
