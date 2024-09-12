import { setChonkyDefaults } from '@aperturerobotics/chonky'
import { ChonkyIconFA } from '@aperturerobotics/chonky-icon-fontawesome'
import { FullFileBrowser } from '@aperturerobotics/chonky'
import { FC } from 'react'

setChonkyDefaults({ iconComponent: ChonkyIconFA })

const FileExplorer: FC<FileExplorer> = () => {
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

// need to be given access to a backchat like thing, that has a files interface

// or, use hooks to get files and dirs ?

interface FileExplorer {
  api: {
    ls: () => Promise<string[]>
  }
}
