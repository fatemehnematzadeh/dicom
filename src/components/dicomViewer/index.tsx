import { useEffect, useRef, useState } from 'react'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import * as dicomParser from 'dicom-parser'

cornerstoneWADOImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.dicomParser = dicomParser
cornerstoneWADOImageLoader.configure({
  useWebWorkers: false,
})

interface DicomMetadata {
  PatientID: string
  Modality: string
  SeriesInstanceUID: string
  StudyInstanceUID: string
}

interface ExtendedViewport extends cornerstone.Viewport {
  displayedArea?: {
    tlhc: { x: number; y: number }
    brhc: { x: number; y: number }
    rowPixelSpacing: number
    columnPixelSpacing: number
  }
}

function DicomViewer({
  file,
  onMetadataLoad,
}: {
  file: File
  onMetadataLoad: (metadata: DicomMetadata) => void
}) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (file && viewerRef.current) {
      const element = viewerRef.current
      cornerstone.enable(element)

      const reader = new FileReader()
      reader.onload = e => {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(
          new Blob([arrayBuffer])
        )

        cornerstone.loadImage(imageId).then(
          image => {
            const viewport = cornerstone.getDefaultViewportForImage(
              element,
              image
            ) as ExtendedViewport

            // Implement tiling approach
            const tileSize = 1024
            const { width, height } = image

            for (let y = 0; y < height; y += tileSize) {
              for (let x = 0; x < width; x += tileSize) {
                const tileWidth = Math.min(tileSize, width - x)
                const tileHeight = Math.min(tileSize, height - y)

                const tileViewport: ExtendedViewport = {
                  ...viewport,
                  displayedArea: {
                    tlhc: { x, y },
                    brhc: { x: x + tileWidth, y: y + tileHeight },
                    rowPixelSpacing:
                      viewport.displayedArea?.rowPixelSpacing || 1,
                    columnPixelSpacing:
                      viewport.displayedArea?.columnPixelSpacing || 1,
                  },
                }

                cornerstone.displayImage(element, image, tileViewport)
              }
            }

            const dataSet = dicomParser.parseDicom(new Uint8Array(arrayBuffer))
            const metadata = {
              PatientID: dataSet.string('x00100020'),
              Modality: dataSet.string('x00080060'),
              SeriesInstanceUID: dataSet.string('x0020000e'),
              StudyInstanceUID: dataSet.string('x0020000d'),
            }
            onMetadataLoad(metadata)
          },
          error => {
            console.error('Error loading DICOM:', error)
            setError(
              'Failed to load DICOM image. Please check if the file is valid.'
            )
          }
        )
      }
      reader.readAsArrayBuffer(file)

      return () => {
        cornerstone.disable(element)
      }
    }
  }, [file, onMetadataLoad])

  if (error) {
    return <div>Error: {error}</div>
  }

  return <div ref={viewerRef} className="w-full h-[1000px] object-cover" />
}

export default DicomViewer
