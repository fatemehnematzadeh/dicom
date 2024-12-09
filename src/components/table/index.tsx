import { Table } from 'antd'

interface DicomMetadata {
  PatientID: string
  Modality: string
  SeriesInstanceUID: string
  StudyInstanceUID: string
}

function TableComponent({ metadata }: { metadata: DicomMetadata[] }) {
  const columns = [
    {
      title: 'Patient ID',
      dataIndex: 'PatientID',
      key: 'PatientID',
    },
    {
      title: 'Modality',
      dataIndex: 'Modality',
      key: 'Modality',
    },
    {
      title: 'Series Instance UID',
      dataIndex: 'SeriesInstanceUID',
      key: 'SeriesInstanceUID',
    },
    {
      title: 'Study Instance UID',
      dataIndex: 'StudyInstanceUID',
      key: 'StudyInstanceUID',
    },
  ]

  return (
    <div className="overflow-hidden  rounded-lg shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
      <Table
        columns={columns}
        dataSource={metadata}
        pagination={false}
        components={{
          header: {
            cell: props => (
              <th
                {...props}
                className="!w-full !bg-gradient-to-b !from-green-500 !via-sky-500 !to-blue-600 !text-white !font-bold !text-center "
              />
            ),
          },
        }}
      />
    </div>
  )
}

export default TableComponent
