import ResourcePage from '../ResourcePage.jsx'

const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
]

export default function AdminRegistrations() {
  return <ResourcePage
    title="Registrations"
    description="Review certification applicants and payment verification records. Payment status is verified by the Django server and cannot be changed here."
    endpoint="/admin/registrations/"
    statusOptions={statuses}
    columns={[
      { key: 'name', label: 'Applicant' },
      { key: 'level', label: 'Level' },
      { key: 'email', label: 'Email' },
      { key: 'payment_status', label: 'Payment' },
      { key: 'status', label: 'Review status' },
      { key: 'created_at', label: 'Received', render: (row) => new Date(row.created_at).toLocaleDateString() },
    ]}
    fields={[{ name: 'status', label: 'Review status', type: 'select', options: statuses }]}
  />
}