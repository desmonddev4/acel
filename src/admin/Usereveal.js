import { useEffect } from 'react'

// Adds `is-in` to any [data-reveal] element when it scrolls into view.
// Pass a dependency (e.g. loaded data) so newly rendered elements are picked up.
export default function useReveal(dep) {
  useEffect(() => {
    const items = document.querySelectorAll('[data-reveal]:not(.is-in)')
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'))
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      }),
      { threshold: 0.12 },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [dep])
}