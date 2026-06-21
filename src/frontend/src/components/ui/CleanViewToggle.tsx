import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const KEY = 'vite-ui-clean-view'

export function CleanViewToggle() {
  const [active, setActive] = useState(() => localStorage.getItem(KEY) === 'true')

  const toggle = () => {
    const next = !active
    setActive(next)
    localStorage.setItem(KEY, String(next))
    document.documentElement.classList.toggle('clean-view', next)
  }

  return (
    <button
      aria-label="Toggle clean view"
      aria-pressed={active}
      onClick={toggle}
      className={`rounded-md p-2 transition-colors ${active ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {active ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  )
}
