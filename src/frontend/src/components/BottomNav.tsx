import { Home, Settings } from 'lucide-react'

interface BottomNavProps {
  page: number
  onHome: () => void
  onSettings: () => void
}

const tabs = [
  { label: 'Home',     icon: Home,     page: 0, handler: 'onHome'     },
  { label: 'Settings', icon: Settings, page: 1, handler: 'onSettings' },
] as const

type Handler = typeof tabs[number]['handler']

export default function BottomNav(props: BottomNavProps) {
  const { page } = props

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex items-stretch border-t bg-background md:hidden">
      {tabs.map(({ label, icon: Icon, page: tabPage, handler }) => (
        <button
          key={label}
          aria-label={label}
          data-active={page === tabPage ? 'true' : 'false'}
          onClick={props[handler as Handler]}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors
            ${page === tabPage ? 'text-foreground' : 'text-muted-foreground'}`}
        >
          <Icon size={20} />
          {label}
        </button>
      ))}
    </nav>
  )
}
