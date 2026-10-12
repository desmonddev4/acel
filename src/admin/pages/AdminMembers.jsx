import ResourcePage from '../ResourcePage.jsx'

export default function AdminMembers() {
  return <ResourcePage
    title="Members"
    description="Maintain the member register. Public records appear on the website directory; private records remain available only to staff."
    endpoint="/admin/members/"
    columns={[
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'category', label: 'Tier / grade' },
      { key: 'sector', label: 'Sector' },
      { key: 'country', label: 'Country' },
      { key: 'is_public', label: 'Public' },
    ]}
    fields={[
      { name: 'name', label: 'Name', required: true },
      { name: 'type', label: 'Member type', type: 'select', defaultValue: 'Organisation', options: [{ value: 'Organisation', label: 'Organisation' }, { value: 'Individual', label: 'Individual' }] },
      { name: 'category', label: 'Tier or grade', required: true },
      { name: 'sector', label: 'Sector', required: true },
      { name: 'country', label: 'Country', required: true },
      { name: 'since', label: 'Member since', type: 'number', min: 1900, required: true },
      { name: 'is_public', label: 'Public listing', type: 'checkbox', checkboxLabel: 'Show this member in the public directory', defaultValue: true },
    ]}
  />
}