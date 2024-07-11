import ThreeBox, { type ThreeBoxProps as ThreeBoxProps } from './ThreeBox.tsx'
import * as React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export interface BackchatDialogProps extends ThreeBoxProps {
  open: boolean
  handleClose: () => void
}

const BackchatDialog: React.FC<BackchatDialogProps> = (props) => {
  const { open, handleClose, ...threeBox } = props

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      keepMounted
      scroll='paper'
    >
      <AppBar color='error' position='sticky'>
        <Toolbar>
          <IconButton
            edge='start'
            color='inherit'
            onClick={handleClose}
            aria-label='close'
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
            Backchat 🤖
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <ThreeBox {...threeBox} />
      </DialogContent>
    </Dialog>
  )
}

export default BackchatDialog
