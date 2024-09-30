import { FC, useEffect, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Inline from 'yet-another-react-lightbox/plugins/inline'
import { StateboardApi } from '../stories/Stateboard'

interface ImageViewerProps {
  api: StateboardApi
}

export const ImageViewer: FC<ImageViewerProps> = ({ api }) => {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  // affect the selection when the carousel moves around
  const selectedFile = api.useSelectedFile()
  // const files = api.useFilesList()
  // filter these for any image files that we can display
  // for each one, but prioritizing the selected file, pull down the binary data

  // when the carousel selection changes, change the selection

  const binary = api.useSelectedFileBinary()

  const [imageSrc, setImageSrc] = useState<string>()

  useEffect(() => {
    if (!binary || !selectedFile) {
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result)
      } else {
        console.error('Failed to read binary data')
      }
      console.log('loaded image', binary.length)
    }
    const blob = new Blob([binary], { type: 'image/jpeg' })
    reader.readAsDataURL(blob)
  }, [binary, selectedFile])

  const toggleOpen = (state: boolean) => () => setOpen(state)

  const updateIndex = ({ index: current }: { index: number }) =>
    setIndex(current)
  const slides = [{ src: imageSrc || '' }]

  return (
    <>
      <Lightbox
        index={index}
        slides={slides}
        plugins={[Inline]}
        on={{
          click: toggleOpen(true),
        }}
        carousel={{
          padding: 0,
          spacing: 0,
          imageFit: 'contain',
        }}
        inline={{
          style: {
            width: '100%',
            maxWidth: '900px',
            aspectRatio: '3 / 2',
            margin: '0 auto',
          },
        }}
      />

      <Lightbox
        open={open}
        close={toggleOpen(false)}
        index={index}
        slides={slides}
        on={{ view: updateIndex }}
        animation={{ fade: 0 }}
        controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
      />
    </>
  )
}
