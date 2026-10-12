import ResourcePage from '../ResourcePage.jsx'

const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
]

export default function AdminApplications() {
  return <ResourcePage
    title="Applications"
    description="Review organisation and individual membership applications, inspect submitted details, and record the decision."
    endpoint="/admin/applications/"
    statusOptions={statuses}
    columns={[
      { key: 'name', label: 'Applicant' },
      { key: 'stream', label: 'Type' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Received', render: (row) => new Date(row.created_at).toLocaleDateString() },
    ]}
    fields={[{ name: 'status', label: 'Review status', type: 'select', options: statuses }]}
  />
}