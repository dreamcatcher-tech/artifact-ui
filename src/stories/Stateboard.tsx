import { FC } from 'react'
import Debug from 'debug'
const debug = Debug('AI:Stateboard')

interface StateboardProps {
  show: boolean
}

const Stateboard: FC<StateboardProps> = () => {
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

  return <div>test stateboard</div>
}

export default Stateboard
