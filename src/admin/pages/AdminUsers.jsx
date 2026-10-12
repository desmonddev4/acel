import ResourcePage from '../ResourcePage.jsx'

export default function AdminUsers() {
  return <ResourcePage
    title="Admin users"
    description="Add and manage the people who can sign in to this dashboard. Leave the password blank when editing to keep it unchanged."
    endpoint="/admin/users/"
    columns={[
      { key: 'username', label: 'Username' },
      { key: 'first_name', label: 'First name' },
      { key: 'last_name', label: 'Last name' },
      { key: 'email', label: 'Email' },
      { key: 'is_active', label: 'Active' },
      { key: 'last_login', label: 'Last sign-in', render: (row) => (row.last_login ? new Date(row.last_login).toLocaleDateString() : 'Never') },
    ]}
    fields={[
      { name: 'username', label: 'Username', required: true },
      { name: 'first_name', label: 'First name' },
      { name: 'last_name', label: 'Last name' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'password', label: 'Password (min. 8 characters)', type: 'password' },
      { name: 'is_active', label: 'Status', type: 'checkbox', checkboxLabel: 'Account is active', defaultValue: true },
    ]}
  />
}
