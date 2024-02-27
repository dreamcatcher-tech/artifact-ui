import Input from './Input.tsx'
import Provider from './MockAPI.tsx'
import Debug from 'debug'

export default {
  title: 'Input',
  component: Input,
}

const Template = (args) => {
  Debug.enable('*')
  return (
    <Provider>
      <Input {...args} />
    </Provider>
  )
}

export const Blank = Template.bind({})
export const Preload = Template.bind({})
Preload.args = { preload: 'Hello' }
export const Presubmit = Template.bind({})
Presubmit.args = { preload: 'Say a single word', presubmit: true }
