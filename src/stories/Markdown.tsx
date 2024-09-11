import { FC } from 'react'
import remarkGfm from 'remark-gfm'
import ReactMarkdown, { Components } from 'react-markdown'
import { Mermaid } from './Mermaid.tsx'

const Markdown: FC<{ content: string }> = ({ content }) => {
  const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---/)
  const frontmatter = frontmatterMatch ? frontmatterMatch[0] : ''
  const markdownContent = content.replace(frontmatter, '')

  // TODO change this to use a prism or other syntax highlighter
  return (
    <>
      {frontmatter && (
        <div className='frontmatter'>
          <pre>{frontmatter}</pre>
        </div>
      )}
      <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>
        {markdownContent}
      </ReactMarkdown>
    </>
  )
}

const renderers: Partial<Components> = {
  code: ({ className, children, ...props }) => {
    const match = /language-(mermaid)/.exec(className || '')
    return match ? (
      <Mermaid chart={String(children).replace(/\n$/, '')} />
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
}

export default Markdown
