import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import { TextField } from '../components/forms/FormFields.jsx'
import { requestJson } from '../lib/api.js'

export default function CertificationVerify() {
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)
  const [match, setMatch] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setSearched(true)
    setMatch(null)
    setLookupError('')
    setIsLoading(true)
    try {
      setMatch(await requestJson(`/public/certificates/${encodeURIComponent(query.trim())}/`))
    } catch (error) {
      if (error.message !== 'Certificate not found.') setLookupError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Professional certification"
        title="Verify a certificate"
        intro="Enter a certificate number to confirm whether it was issued by the Chamber, and check its current status."
      />

      <section className="section-light py-14 md:py-20">
        <div className="container-edge grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-[0_18px_40px_-24px_rgba(0,20,45,0.25)] md:p-10">
              <form onSubmit={onSubmit} className="flex flex-col gap-6 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <TextField
                    label="Certificate number"
                    required
                    placeholder="e.g. ACEL-PRA-2026-0003"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setSearched(false)
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="liquid-btn liquid-btn-hero disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ display: 'inline-flex', alignItems: 'center', height: 'fit-content' }}
                >
                  <span className="liquid-blob" />
                  <span className="liquid-blob two" />
                  <span className="liquid-label">{isLoading ? 'Checking…' : 'Verify'}</span>
                </button>
              </form>

              {searched && !isLoading && (
                <div className="mt-8">
                  {lookupError ? (
                    <div role="alert" className="rounded-xl border border-[#B42318]/30 bg-[#B42318]/5 p-6 text-[14px] text-[#B42318]">
                      {lookupError}
                    </div>
                  ) : match ? (
                    <div className="rounded-xl border border-emerald/30 bg-emerald/5 p-6">
                      <p className="mb-4 flex items-center gap-2 text-[14.5px] font-medium text-emerald">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald text-white">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        {match.status === 'Active' ? 'Certificate verified' : 'Certificate found — not currently active'}
                      </p>
                      <dl className="grid gap-3 text-[14.5px] sm:grid-cols-2">
                        <div>
                          <dt className="text-ink/50">Certificate number</dt>
                          <dd className="font-medium text-ink">{match.id}</dd>
                        </div>
                        <div>
                          <dt className="text-ink/50">Holder</dt>
                          <dd className="font-medium text-ink">{match.holder}</dd>
                        </div>
                        <div>
                          <dt className="text-ink/50">Level</dt>
                          <dd className="font-medium text-ink">{match.level}</dd>
                        </div>
                        <div>
                          <dt className="text-ink/50">Issued</dt>
                          <dd className="font-medium text-ink">{match.issued}</dd>
                        </div>
                        <div>
                          <dt className="text-ink/50">Status</dt>
                          <dd className={`font-medium ${match.status === 'Active' ? 'text-emerald' : 'text-ink/70'}`}>
                            {match.status}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#B42318]/30 bg-[#B42318]/5 p-6">
                      <p className="text-[14.5px] font-medium text-[#B42318]">No certificate found</p>
                      <p className="mt-2 text-[14px] leading-[1.6] text-ink/65">
                        We couldn&rsquo;t find a certificate with that number. Check it against the certificate or
                        register document, or{' '}
                        <Link to="/contact" className="text-emerald underline underline-offset-2">contact the Secretariat</Link>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <h2 className="font-display text-[1.35rem] leading-snug text-ink">About the register</h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-ink/70">
              Certified professionals are listed on the Chamber&rsquo;s register so employers and clients can
              confirm a credential is genuine and current.
            </p>
            <p className="mt-4 text-[14px] leading-[1.7] text-ink/55">
              Not certified yet?{' '}
              <Link to="/certification/register" className="text-emerald underline underline-offset-2">
                Register for certification
              </Link>.
            </p>
          </aside>
        </div>
      </section>
    </>
  )
}
