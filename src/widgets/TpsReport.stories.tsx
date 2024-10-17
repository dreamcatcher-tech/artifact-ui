import { tpsReport } from '../data.ts'
import type { Meta, StoryObj } from '@storybook/react'
import TpsReport from './TpsReport.tsx'

const meta: Meta<typeof TpsReport> = {
  title: 'Widgets/TpsReport',
  component: TpsReport,
  args: { tpsReport },
}

export default meta
type Story = StoryObj<typeof TpsReport>

export const Basic: Story = {}

export const Narrow: Story = {
  parameters: {
    viewport: {
      viewports: {
        narrow: {
          name: 'Narrow',
          styles: {
            width: '400px',
            height: '100%',
          },
        },
      },
      defaultViewport: 'narrow',
    },
  },
}
