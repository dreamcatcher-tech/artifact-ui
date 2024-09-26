import * as React from 'react'
import { type TestFile } from '../api/tps-report.ts'
import ReactJson from '@microlink/react-json-view'

export interface TpsReport {
  tpsReport: TestFile
}

const TpsReport: React.FC<TpsReport> = ({ tpsReport }) => {
  return (
    <ReactJson
      src={tpsReport}
      quotesOnKeys={false}
      name={false}
      collapseStringsAfterLength={50}
      displayDataTypes={false}
      indentWidth={2}
      enableClipboard={false}
    />
  )
}

export default TpsReport

// prolly want some controlls over the testing by way of a button
// button should drive the prompt to do something, like rerun the test

// selection of the case could be used ?

// when select the prompt selection, would reselect the widget

// stateboard would be set inside the longthread
