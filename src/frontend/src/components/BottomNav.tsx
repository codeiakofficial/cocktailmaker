import * as React from 'react'
import { Home, FlaskConical, Bot } from 'lucide-react'

interface BottomNavProps {
  page: number
  onHome: () => void
  onIngredients: () => void
  onAgents: () => void
  newRecipeTrigger: React.ReactNode
}

const tabs = [
  { label: 'Home', icon: Home, page: 0 },
  { label: 'Ingredients', icon: FlaskConical, page: 1 },
  { label: 'Agents', icon: Bot, page: 2 },
]

export default function BottomNav({ page, onHome, onIngredients, onAgents, newRecipeTrigger }: BottomNavProps) {
  const handlers = [onHome, onIngredients, onAgents]

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex items-stretch border-t bg-background md:hidden">
      {tabs.map(({ label, icon: Icon, page: tabPage }) => (
        <button
          key={label}
          aria-label={label}
          data-active={page === tabPage ? 'true' : 'false'}
          onClick={handlers[tabPage]}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors
            ${page === tabPage ? 'text-foreground' : 'text-muted-foreground'}`}
        >
          <Icon size={20} />
          {label}
        </button>
      ))}
      <div className="flex flex-1 flex-col items-center justify-center">
        {newRecipeTrigger}
      </div>
    </nav>
  )
}
