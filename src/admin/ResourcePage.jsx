import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import { adminRequest } from './api.js'

const css = `
.rp{--ink:#10201a;--em:#0b8a3e;--em-deep:#047622;--gold:#b88a42;--line:rgba(16,32,26,.09);--red:#b42318;font-size:13px;color:var(--ink)}
.rp *{box-sizing:border-box}
.rp-glass{background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);border-radius:14px;
  backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);
  box-shadow:0 8px 24px rgba(16,32,26,.07),inset 0 1px 0 rgba(255,255,255,.85)}

.rp-head{display:flex;gap:12px;align-items:center;justify-content:space-between;margin-bottom:12px;padding:12px 14px;animation:rpIn .45s both}
.rp-head p{margin:0;max-width:640px;font-size:12.5px;line-height:1.55;color:rgba(16,32,26,.62)}
.rp-head-actions{display:flex;gap:8px;flex:none}
@keyframes rpIn{from{opacity:0;transform:translateY(10px)}}

.rp-btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;padding:0 13px;
  border:0;border-radius:10px;font-size:12.5px;font-weight:600;cursor:pointer;color:#fff;
  background:linear-gradient(135deg,#17352a,#10201a);box-shadow:0 6px 14px rgba(16,32,26,.22);
  transition:transform .2s,box-shadow .2s,background .25s}
.rp-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.28) 50%,transparent 65%);transform:translateX(-120%);transition:transform .55s}
.rp-btn:hover:not(:disabled){background:linear-gradient(135deg,#0b8a3e,#047622);transform:translateY(-2px);box-shadow:0 10px 20px rgba(4,118,34,.32)}
.rp-btn:hover:not(:disabled)::after{transform:translateX(120%)}
.rp-btn:active:not(:disabled){transform:translateY(0)}
.rp-btn:disabled{opacity:.5;cursor:not-allowed}
.rp-btn.ghost{color:var(--ink);background:rgba(255,255,255,.7);border:1px solid var(--line);box-shadow:none}
.rp-btn.ghost:hover:not(:disabled){background:#fff;color:var(--em-deep);box-shadow:0 8px 16px rgba(16,32,26,.1)}
.rp-btn.ghost::after{display:none}
.rp-btn.icon{width:34px;padding:0}
.rp-btn.icon:hover:not(:disabled) svg{transform:rotate(180deg)}
.rp-btn svg{transition:transform .4s}
.rp-btn.danger{color:var(--red);background:rgba(255,255,255,.7);border:1px solid rgba(180,35,24,.25);box-shadow:none}
.rp-btn.danger:hover:not(:disabled){color:#fff;background:var(--red);box-shadow:0 8px 16px rgba(180,35,24,.3)}
.rp-btn.danger::after{display:none}

.rp-notice,.rp-error{margin:0 0 12px;padding:8px 12px;border-radius:10px;font-size:12.5px;animation:rpIn .3s both}
.rp-notice{color:var(--em-deep);background:rgba(11,138,62,.1);border:1px solid rgba(11,138,62,.22)}
.rp-error{color:var(--red);background:rgba(180,35,24,.08);border:1px solid rgba(180,35,24,.22)}

.rp-tools{display:flex;gap:8px;margin-bottom:12px;padding:8px;animation:rpIn .5s .05s both}
.rp-search{position:relative;flex:1;min-width:0}
.rp-search svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:rgba(16,32,26,.4);pointer-events:none}
.rp-input,.rp-select{height:34px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.75);font-size:12.5px;color:var(--ink);outline:none;transition:.2s}
.rp-input{width:100%;padding:0 12px 0 32px}
.rp-select{padding:0 10px}
.rp-input:focus,.rp-select:focus{border-color:var(--em);background:#fff;box-shadow:0 0 0 3px rgba(11,138,62,.12)}

.rp-table{overflow:hidden;animation:rpIn .5s .1s both}
.rp-scroll{overflow-x:auto}
.rp-table table{width:100%;min-width:620px;border-collapse:collapse;text-align:left}
.rp-table th{padding:9px 14px;font-size:11.5px;font-weight:600;color:rgba(16,32,26,.5);background:rgba(255,255,255,.45);border-bottom:1px solid var(--line);white-space:nowrap}
.rp-table td{max-width:260px;padding:9px 14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;color:rgba(16,32,26,.78);border-bottom:1px solid rgba(16,32,26,.05)}
.rp-table tbody tr{animation:rpRow .4s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i,0) * 22ms);transition:background .2s}
@keyframes rpRow{from{opacity:0;transform:translateX(-8px)}}
.rp-table tbody tr:hover{background:rgba(11,138,62,.07)}
.rp-table tbody tr:last-child td{border-bottom:0}
.rp-empty{padding:34px 14px!important;text-align:center;color:rgba(16,32,26,.5)}
.rp-link{padding:4px 10px;border:1px solid transparent;border-radius:8px;background:transparent;font-size:12px;font-weight:600;color:var(--em-deep);cursor:pointer;transition:.2s}
.rp-link:hover{background:rgba(11,138,62,.12);border-color:rgba(11,138,62,.2);transform:translateX(2px)}
.rp-right{text-align:right!important}

.rp-pager{display:flex;align-items:center;justify-content:space-between;margin-top:10px;font-size:12px;color:rgba(16,32,26,.55)}
.rp-pager .rp-btn{height:30px;font-size:12px}

.rp-overlay{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(16,32,26,.38);backdrop-filter:blur(5px);animation:rpFade .25s both}
@keyframes rpFade{from{opacity:0}}
.rp-drawer{display:flex;flex-direction:column;width:100%;max-width:680px;max-height:calc(100vh - 40px);max-height:calc(100dvh - 40px);overflow:hidden;
  background:rgba(252,253,252,.94);border:1px solid rgba(255,255,255,.85);border-radius:18px;
  backdrop-filter:blur(26px) saturate(170%);-webkit-backdrop-filter:blur(26px) saturate(170%);
  box-shadow:0 30px 70px rgba(16,32,26,.35);animation:rpPop .3s cubic-bezier(.2,.8,.2,1) both}
@keyframes rpPop{from{transform:translateY(14px) scale(.98);opacity:0}}
.rp-dh{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 22px;border-bottom:1px solid var(--line);
  background:linear-gradient(135deg,rgba(11,138,62,.1),rgba(184,138,66,.1))}
.rp-dh small{display:block;font-size:11.5px;color:var(--gold);font-weight:600}
.rp-dh h2{margin:2px 0 0;font-family:var(--font-display,inherit);font-size:18px;font-weight:600}
.rp-form{display:flex;flex:1;min-height:0;flex-direction:column}
.rp-body{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:16px;padding:20px 22px}
.rp-sec{margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(16,32,26,.45)}
.rp-sum{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;overflow:hidden;border-radius:12px;border:1px solid var(--line);background:var(--line)}
.rp-sum div{padding:9px 12px;background:rgba(255,255,255,.85);min-width:0}
.rp-sum dt{font-size:11px;color:rgba(16,32,26,.5)}
.rp-sum dd{margin:2px 0 0;font-size:13px;font-weight:500;color:var(--ink);overflow-wrap:anywhere;white-space:pre-wrap}
.rp-sum .wide{grid-column:1/-1}
.rp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.rp-grid .full{grid-column:1/-1}
.rp-field{display:block;font-size:12px;font-weight:600;color:rgba(16,32,26,.75)}
.rp-field .ctl{display:block;width:100%;margin-top:6px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:#fff;font:inherit;font-size:13.5px;font-weight:400;color:var(--ink);outline:none;transition:.2s}
.rp-field .ctl:focus{border-color:var(--em);box-shadow:0 0 0 3px rgba(11,138,62,.12)}
.rp-check{display:flex;align-items:center;gap:8px;margin-top:6px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:#fff;font-size:13px;font-weight:400;color:var(--ink);cursor:pointer;transition:.2s}
.rp-check:hover{border-color:rgba(11,138,62,.35)}
.rp-check input{width:15px;height:15px;accent-color:#047622}
.rp-pay{margin:0;font-size:12px;color:rgba(16,32,26,.6)}
.rp-pay code{color:var(--ink)}
.rp-foot{display:flex;align-items:center;justify-content:space-between;padding:12px 22px;border-top:1px solid var(--line);background:rgba(255,255,255,.8)}
.rp-foot div{display:flex;gap:8px}
@media(max-width:640px){.rp-overlay{padding:0;align-items:flex-end}.rp-drawer{max-height:94dvh;border-radius:18px 18px 0 0}.rp-grid,.rp-sum{grid-template-columns:1fr}.rp-head{flex-direction:column;align-items:stretch}.rp-head-actions{justify-content:flex-end}.rp-tools{flex-direction:column}}
@media(prefers-reduced-motion:reduce){.rp *{animation:none!important;transition:none!important}}
`

function valueAt(record, key) {
  return key.split('.').reduce((value, part) => value?.[part], record)
}

function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

const humanize = (key) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^./, (c) => c.toUpperCase())

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.map(formatValue).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function Summary({ title, items }) {
  if (items.length === 0) return null
  return (
    <section>
      <h3 className="rp-sec">{title}</h3>
      <dl className="rp-sum">
        {items.map(([label, value]) => (
          <div key={label} className={String(value).length > 40 || String(value).includes('\n') ? 'wide' : undefined}>
            <dt>{label}</dt><dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function EditorField({ field, value, onChange }) {
  const common = {
    id: `record-${field.name}`,
    name: field.name,
    value: value ?? '',
    onChange: (event) => onChange(field.name, field.type === 'checkbox' ? event.target.checked : event.target.value),
    className: 'ctl',
  }

  return (
    <label className={`rp-field${field.type === 'textarea' || field.type === 'checkbox' ? ' full' : ''}`}>
      {field.label}
      {field.type === 'textarea' ? (
        <textarea {...common} rows={field.rows || 4} />
      ) : field.type === 'select' ? (
        <select {...common}>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
      ) : field.type === 'checkbox' ? (
        <span className="rp-check">
          <input id={common.id} type="checkbox" checked={Boolean(value)} onChange={common.onChange} />
          {field.checkboxLabel || field.label}
        </span>
      ) : (
        <input {...common} type={field.type || 'text'} required={field.required} min={field.min} />
      )}
    </label>
  )
}

export default function ResourcePage({ title, description, endpoint, columns, fields, statusOptions, recordLabel }) {
  const [records, setRecords] = useState([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    const params = new URLSearchParams({ page: String(page) })
    if (search.trim()) params.set('search', search.trim())
    if (status) params.set('status', status)
    setLoading(true)
    setError('')
    adminRequest(`${endpoint}?${params}`)
      .then((data) => {
        if (!active) return
        setRecords(data.results || data)
        setPageCount(data.count ? Math.ceil(data.count / 100) : 1)
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [endpoint, page, reload, search, status])

  const closeEditor = () => {
    setSelected(null)
    setCreating(false)
    setDraft({})
    setError('')
  }

  const openCreate = () => {
    setSelected(null)
    setCreating(true)
    setError('')
    setDraft(Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? ''])))
  }

  const openRecord = (record) => {
    setCreating(false)
    setSelected(record)
    setError('')
    setDraft(Object.fromEntries(fields.map((field) => [field.name, record[field.name] ?? field.defaultValue ?? ''])))
  }

  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }))

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const path = selected ? `${endpoint}${selected.id}/` : endpoint
      await adminRequest(path, { method: selected ? 'PATCH' : 'POST', body: JSON.stringify(draft) })
      closeEditor()
      setNotice('Changes saved.')
      setReload((count) => count + 1)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!selected || !window.confirm(`Delete ${recordName(selected)}? This cannot be undone.`)) return
    setSaving(true)
    setError('')
    try {
      await adminRequest(`${endpoint}${selected.id}/`, { method: 'DELETE' })
      closeEditor()
      setNotice('Record deleted.')
      setReload((count) => count + 1)
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setSaving(false)
    }
  }

  const recordName = (record) => (recordLabel ? recordLabel(record) : record.name || record.id || record.number)

  const singular = title.toLowerCase().replace(/s$/, '')

  return (
    <div className="rp">
      <style>{css}</style>

      <div className="rp-glass rp-head">
        <p>{description}</p>
        <div className="rp-head-actions">
          <button type="button" onClick={() => setReload((count) => count + 1)} title="Refresh records" aria-label="Refresh records" className="rp-btn ghost icon"><RefreshCw size={14} aria-hidden="true" /></button>
          {fields.length > 0 && <button type="button" onClick={openCreate} className="rp-btn"><Plus size={14} aria-hidden="true" /> Add {singular}</button>}
        </div>
      </div>

      {notice && <p role="status" className="rp-notice">{notice}</p>}
      {error && !selected && !creating && <p role="alert" className="rp-error">{error}</p>}

      <div className="rp-glass rp-tools">
        <label className="rp-search">
          <Search size={14} aria-hidden="true" />
          <input className="rp-input" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value) }} placeholder={`Search ${title.toLowerCase()}…`} aria-label={`Search ${title.toLowerCase()}`} />
        </label>
        {statusOptions && (
          <select className="rp-select" aria-label="Filter by status" value={status} onChange={(event) => { setPage(1); setStatus(event.target.value) }}>
            <option value="">All statuses</option>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        )}
      </div>

      <div className="rp-glass rp-table">
        <div className="rp-scroll">
          <table>
            <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}<th className="rp-right">Record</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={columns.length + 1} className="rp-empty">Loading records…</td></tr>
                : records.length === 0 ? <tr><td colSpan={columns.length + 1} className="rp-empty">No records found.</td></tr>
                  : records.map((record, index) => (
                    <tr key={record.id} style={{ '--i': Math.min(index, 20) }}>
                      {columns.map((column) => <td key={column.key}>{displayValue(column.render ? column.render(record) : valueAt(record, column.key))}</td>)}
                      <td className="rp-right"><button type="button" onClick={() => openRecord(record)} className="rp-link">View / edit</button></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rp-pager">
        <span>Page {page} of {pageCount}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="rp-btn ghost" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</button>
          <button type="button" className="rp-btn ghost" disabled={page >= pageCount || loading} onClick={() => setPage((current) => current + 1)}>Next</button>
        </div>
      </div>

      {(selected || creating) && (
        <div className="rp-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeEditor() }}>
          <section role="dialog" aria-modal="true" aria-labelledby="editor-title" className="rp-drawer">
            <header className="rp-dh">
              <div>
                <small>{creating ? 'New record' : 'Record details'}</small>
                <h2 id="editor-title">{creating ? `Add ${singular}` : selected ? recordName(selected) : title}</h2>
              </div>
              <button type="button" onClick={closeEditor} title="Close" aria-label="Close" className="rp-btn ghost icon"><X size={15} aria-hidden="true" /></button>
            </header>
            <form onSubmit={save} className="rp-form">
              <div className="rp-body">
                {selected && <Summary title="Record" items={columns.map((column) => [column.label, formatValue(column.render ? column.render(selected) : valueAt(selected, column.key))])} />}
                {selected?.payload && <Summary title="Submitted details" items={Object.entries(selected.payload).map(([key, value]) => [humanize(key), formatValue(value)])} />}
                <section>
                  <h3 className="rp-sec">{selected ? 'Edit' : 'Details'}</h3>
                  <div className="rp-grid">
                    {fields.map((field) => <EditorField key={field.name} field={field} value={draft[field.name]} onChange={updateDraft} />)}
                  </div>
                </section>
                {selected?.payment_reference && <p className="rp-pay">Payment reference: <code>{selected.payment_reference}</code> · {selected.payment_status}</p>}
                {error && <p role="alert" className="rp-error">{error}</p>}
              </div>
              <footer className="rp-foot">
                <div>{selected && <button type="button" disabled={saving} onClick={remove} title="Delete record" aria-label="Delete record" className="rp-btn danger icon"><Trash2 size={14} aria-hidden="true" /></button>}</div>
                <div>
                  <button type="button" onClick={closeEditor} className="rp-btn ghost">Cancel</button>
                  <button type="submit" disabled={saving} className="rp-btn">{saving ? 'Saving…' : 'Save changes'}</button>
                </div>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}