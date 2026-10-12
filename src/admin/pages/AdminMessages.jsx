import ResourcePage from '../ResourcePage.jsx'

const statuses = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
]

export default function AdminMessages() {
  return <ResourcePage
    title="Messages"
    description="Read incoming contact enquiries, inspect the full message, and mark it as read or archived."
    endpoint="/admin/messages/"
    statusOptions={statuses}
    columns={[
      { key: 'name', label: 'From' },
      { key: 'topic', label: 'Topic' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Received', render: (row) => new Date(row.created_at).toLocaleDateString() },
    ]}
    fields={[{ name: 'status', label: 'Message status', type: 'select', options: statuses }]}
  />
}