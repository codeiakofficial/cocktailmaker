import { Home, Settings } from 'lucide-react'

interface BottomNavProps {
  page: number
  onHome: () => void
  onSettings: () => void
  centerAction?: React.ReactNode
}


export default function BottomNav(props: BottomNavProps) {
  const { page, centerAction } = props

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex items-stretch border-t bg-background md:hidden">
      <button
        aria-label="Home"
        data-active={page === 0 ? 'true' : 'false'}
        onClick={props.onHome}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors ${page === 0 ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        <Home size={20} />
        Home
      </button>

      {centerAction && (
        <div className="flex flex-1 items-center justify-center">
          {centerAction}
        </div>
      )}

      <button
        aria-label="Settings"
        data-active={page === 1 ? 'true' : 'false'}
        onClick={props.onSettings}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors ${page === 1 ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        <Settings size={20} />
        Settings
      </button>
    </nav>
  )
}
