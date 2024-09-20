import { setChonkyDefaults } from '@aperturerobotics/chonky'
import { ChonkyIconFA } from '@aperturerobotics/chonky-icon-fontawesome'
import {
  FullFileBrowser,
  // FileBrowser,
  // FileList,
  // FileNavbar,
  // FileToolbar,
  // FileContextMenu,
} from '@aperturerobotics/chonky'
import { FC } from 'react'
import { WidgetProps } from '../stories/Stateboard.tsx'

setChonkyDefaults({ iconComponent: ChonkyIconFA })

const FileExplorer: FC<WidgetProps> = ({ api }) => {
  const folderChain = api.useWorkingDir()
  const files = api.useFilesList()
  return (
    <FullFileBrowser
      clearSelectionOnOutsideClick={false}
      onFileAction={(action) => {
        console.log(action)
        if (action.id === 'change_selection') {
          api.setSelection(action.state.selectedFiles)
        }
        if (action.id === 'clear_selection') {
          api.setSelection([])
        }
        if (action.id === 'open_parent_folder') {
          api.openParent()
        }
        if (action.id === 'open_selection') {
          console.log('open_selection', action)
        }
        if (action.id === 'open_files') {
          const { targetFile } = action.payload
          if (!targetFile) {
            console.error('No target file found')
            return
          }
          api.open(targetFile)
        }
        // console.log('action', action)
      }}
      files={files}
      folderChain={folderChain}
      disableDragAndDropProvider={true}
      disableDragAndDrop={true}
    />
  )
}

export default FileExplorer
