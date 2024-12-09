import { Swiper, SwiperSlide } from 'swiper/react'
import DicomViewer from '../../components/dicomViewer'
import { useState } from 'react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { message, UploadProps } from 'antd'
import Dragger from 'antd/es/upload/Dragger'
import { InboxOutlined } from '@ant-design/icons'
import TableComponent from '../../components/table'

interface DicomMetadata {
  PatientID: string
  Modality: string
  SeriesInstanceUID: string
  StudyInstanceUID: string
}

type Props = {}
const HomePage = ({}: Props) => {
  const [files, setFiles] = useState<File[]>([])
  const [allMetadata, setAllMetadata] = useState<DicomMetadata[]>([])

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.dcm',
    showUploadList: false,
    beforeUpload: file => {
      setFiles(prevFiles => [...prevFiles, file])
      message.success({
        content: `${file.name} با موفقیت آپلود شد.`,
        className: 'font-iransans',
      })
      return false
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
    },
  }

  return (
    <div className="flex justify-center items-center flex-col gap-10 overflow-hidden">
      <h1>مشاهده ی عکس های DICOM</h1>
      <Dragger
        {...props}
        className="w-1/2 h-96 shadow-[inset_-3px_1px_110px_29px_#63b3ed,inset_0px_3px_110px_196px_#9ae6b4] rounded-lg bg-white"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined className="!text-black" />
        </p>
        <p className="ant-upload-text font-iransans !text-2xl !text-stone-700">
          فایل های مورد نظر را اینجا بکشید یا کلیک کنید
        </p>
        <p className="ant-upload-hint font-iransans !text-xl">
          فقط فایل های DICOM قابل قبول هستند
        </p>
      </Dragger>
      {allMetadata.length > 0 && (
        <TableComponent key={allMetadata.length} metadata={allMetadata} />
      )}
      {files.length > 0 && (
        <Swiper
          dir="ltr"
          key={files.length}
          navigation={true}
          modules={[Navigation]}
          spaceBetween={50}
          slidesPerView={1}
          style={{ width: '100%', height: '1000px', borderRadius: '10px' }}
        >
          {files.map((file, index) => (
            <SwiperSlide
              key={index}
              style={{ width: '100%', height: '100%', borderRadius: '10px' }}
            >
              <DicomViewer
                file={file}
                onMetadataLoad={metadata => {
                  setAllMetadata(prev => {
                    const exists = prev.some(
                      item =>
                        item.SeriesInstanceUID === metadata.SeriesInstanceUID
                    )
                    if (!exists) {
                      return [...prev, metadata]
                    }
                    return prev
                  })
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  )
}
export default HomePage
