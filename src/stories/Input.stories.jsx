import Input from './Input.tsx'
import Debug from 'debug'

export default {
  title: 'Input',
  component: Input,
}

const fetcher = (key) => {
  console.log('fetcher', key)
}

const Template = (args) => {
  Debug.enable('*')
  return (
    <SWRConfig value={{ fetcher }}>
      <Input {...args} />
    </SWRConfig>
  )
}

export const Blank = Template.bind({})
export const Preload = Template.bind({})
Preload.args = { preload: 'Hello' }
export const Presubmit = Template.bind({})
Presubmit.args = { preload: 'Say a single word', presubmit: true }
