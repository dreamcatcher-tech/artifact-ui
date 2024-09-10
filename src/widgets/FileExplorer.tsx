import { setChonkyDefaults } from '@aperturerobotics/chonky'
import { ChonkyIconFA } from '@aperturerobotics/chonky-icon-fontawesome'
import { FullFileBrowser } from '@aperturerobotics/chonky'

setChonkyDefaults({ iconComponent: ChonkyIconFA })

const FileExplorer = () => {
  const files = [
    { id: 'lht', name: 'Projects', isDir: true },
    { id: 'ht', name: 'Projects/smojects', isDir: true },
    {
      id: 'mcd',
      name: 'chonky-sphere-v2.png',
      thumbnailUrl: 'https://chonky.io/chonky-sphere-v2.png',
    },
  ]
  const folderChain = [{ id: 'xcv', name: 'Demo', isDir: true }]
  return (
    <FullFileBrowser
      files={files}
      folderChain={folderChain}
      disableDragAndDropProvider={true}
    />
  )
}

export default FileExplorer
