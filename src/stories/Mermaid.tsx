import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidProps {
  chart: string
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [raw, setRaw] = useState(true)

  useEffect(() => {
    mermaid
      .parse(chart)
      .then(() => {
        setRaw(false)
      })
      .catch(() => {
        setRaw(true)
      })
  }, [chart])

  useEffect(() => {
    const element = chartRef.current
    if (raw || !element) {
      return
    }
    mermaid.run({ nodes: [element] })
  }, [raw])

  return (
    <div ref={chartRef} className='mermaid'>
      {chart}
    </div>
  )
}
