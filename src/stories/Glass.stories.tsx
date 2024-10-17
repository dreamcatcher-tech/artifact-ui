import type { Meta, StoryObj } from '@storybook/react'
import { Container, Center, Left } from './Glass.tsx'
import { Box } from '@mui/material'

const meta: Meta<typeof Container> = {
  title: 'Glass',
  component: Container,
}

export default meta

type Story = StoryObj<typeof Container>

export const Basic: Story = {
  render: () => (
    <Box height={'90vh'}>
      <Container debug>
        <Left debug>Left</Left>
        <Center debug>Center</Center>
      </Container>
    </Box>
  ),
}
