import { FC } from 'react'
import { WidgetProps } from '../stories/Stateboard.tsx'

import Debug from 'debug'
const log = Debug('AI:Editor')

const Editor: FC<WidgetProps> = ({ api }) => {
  log('Editor', api)

  return <div>editor</div>
}

export default Editor
