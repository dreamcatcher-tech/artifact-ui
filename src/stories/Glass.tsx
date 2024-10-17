import React from 'react'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import PropTypes from 'prop-types'

interface ContainerProps {
  children: React.ReactNode
  debug?: boolean
}
export const Container: React.FC<ContainerProps> = ({ children, debug }) => {
  const background = debug ? 'purple' : undefined
  return (
    <Grid
      container
      sx={{
        height: '100%',
        maxWidth: '100%',
        background,
        p: 1,
        overflow: 'hidden',
        maxHeight: '100%',
      }}
      spacing={1}
      wrap='nowrap'
    >
      {children}
    </Grid>
  )
}

interface LeftProps {
  children: React.ReactNode
  debug?: boolean
}
export const Left: React.FC<LeftProps> = ({ children, debug }) => {
  const orange = debug ? 'orange' : undefined
  const stack = debug ? 'blue' : undefined
  return (
    <Grid
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        background: orange,
        minWidth: 400,
        maxWidth: 800,
        width: {
          xs: 400,
          sm: 600,
          lg: 800,
        },
        wordWrap: 'break-word',
        ml: 1,
        mr: 1,
      }}
    >
      <Stack
        sx={{
          background: stack,
          maxHeight: '100%',
          marginTop: 'auto',
        }}
      >
        {children}
      </Stack>
    </Grid>
  )
}

interface CenterProps {
  children: React.ReactNode
  debug?: boolean
}
export const Center: React.FC<CenterProps> = ({ children, debug }) => {
  return (
    <Stack
      spacing={1}
      sx={{
        flexGrow: 1,
        display: 'flex',
        background: debug ? 'lightyellow' : undefined,
        maxHeight: '100%',
      }}
    >
      {children}
    </Stack>
  )
}
Center.propTypes = {
  children: PropTypes.node,
  debug: PropTypes.bool,
}
