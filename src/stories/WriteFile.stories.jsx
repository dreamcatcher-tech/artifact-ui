import ThreeBox from './ThreeBox'
import { Provider } from './MockProvider.tsx'
import Debug from 'debug'

export default {
  title: 'Write Files',
  component: ThreeBox,
}

const Template = (args) => {
  return (
    <Provider>
      <ThreeBox {...args} />
    </Provider>
  )
}

const preload = `create a new md file`
export const Fake = Template.bind({})
Fake.args = { preload }
export const Presubmit = Template.bind({})
Presubmit.args = { preload, presubmit: true }
