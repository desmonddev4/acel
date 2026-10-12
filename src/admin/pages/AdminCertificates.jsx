import ResourcePage from '../ResourcePage.jsx'

const statuses = [
  { value: 'Active', label: 'Active' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Revoked', label: 'Revoked' },
]

export default function AdminCertificates() {
  return <ResourcePage
    title="Certificates"
    description="Issue and maintain certificate records. Public verification reflects the certificate number, holder, level, issue date and current status."
    endpoint="/admin/certificates/"
    statusOptions={statuses}
    columns={[
      { key: 'id', label: 'Certificate number' },
      { key: 'holder', label: 'Holder' },
      { key: 'level', label: 'Level' },
      { key: 'issued', label: 'Issued' },
      { key: 'status', label: 'Status' },
    ]}
    fields={[
      { name: 'id', label: 'Certificate number', required: true },
      { name: 'holder', label: 'Holder name', required: true },
      { name: 'level', label: 'Certification level', type: 'select', defaultValue: 'Foundation', options: ['Foundation', 'Practitioner', 'Expert'].map((level) => ({ value: level, label: level })) },
      { name: 'issued', label: 'Issue date', type: 'date', required: true },
      { name: 'status', label: 'Status', type: 'select', defaultValue: 'Active', options: statuses },
    ]}
  />
}