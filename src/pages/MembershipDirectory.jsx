import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import { sectors } from '../data/content.js'
import { requestJson } from '../lib/api.js'

const TYPE_FILTERS = ['All', 'Organisation', 'Individual']

export default function MembershipDirectory() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [sector, setSector] = useState('All')
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    requestJson('/public/members/')
      .then(setMembers)
      .catch((error) => setLoadError(error.message))
      .finally(() => setLoading(false))
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return members.filter((m) => {
      if (type !== 'All' && m.type !== type) return false
      if (sector !== 'All' && m.sector !== sector) return false
      if (q && !m.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [members, query, type, sector])

  return (
    <>
      <PageHeader
        eyebrow="Membership"
        title="Member directory"
        intro="A public listing of Chamber members in good standing, by organisation and by individual grade."
      />

      <section className="section-light py-14 md:py-20">
        <div className="container-edge">
          <p className="mb-6 text-[14px] text-ink/65">
            Approved members appear here. <Link to="/membership/apply" className="text-emerald underline underline-offset-2">Apply for membership</Link>.
          </p>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/35 transition-colors focus:border-gold"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-[15px] text-ink transition-colors focus:border-gold"
            >
              {TYPE_FILTERS.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All member types' : t}</option>
              ))}
            </select>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-[15px] text-ink transition-colors focus:border-gold"
            >
              <option value="All">All sectors</option>
              {sectors.list.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <p className="mb-4 text-[13.5px] text-ink/50" aria-live="polite">
            {loading ? 'Loading members…' : loadError || `${results.length} ${results.length === 1 ? 'result' : 'results'}`}
          </p>

          <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-[0_18px_40px_-24px_rgba(0,20,45,0.25)]">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-ink/10 text-[12.5px] uppercase tracking-wide text-ink/45">
                  <th className="px-5 py-4 font-medium">Name</th>
                  <th className="px-5 py-4 font-medium">Type</th>
                  <th className="px-5 py-4 font-medium">Tier / grade</th>
                  <th className="px-5 py-4 font-medium">Sector</th>
                  <th className="px-5 py-4 font-medium">Country</th>
                  <th className="px-5 py-4 font-medium">Member since</th>
                </tr>
              </thead>
              <tbody>
                {loading || loadError || results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-ink/45">
                      {loading ? 'Loading the member register…' : loadError || 'No members match your search.'}
                    </td>
                  </tr>
                ) : (
                  results.map((m) => (
                    <tr key={m.name} className="border-b border-ink/5 last:border-0 hover:bg-emerald/5">
                      <td className="px-5 py-4 font-medium text-ink">{m.name}</td>
                      <td className="px-5 py-4 text-ink/65">{m.type}</td>
                      <td className="px-5 py-4 text-ink/65">{m.category}</td>
                      <td className="px-5 py-4 text-ink/65">{m.sector}</td>
                      <td className="px-5 py-4 text-ink/65">{m.country}</td>
                      <td className="px-5 py-4 text-ink/65">{m.since}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}
