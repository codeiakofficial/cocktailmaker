import * as React from 'react'
import IngredientsSettings from './IngredientsSettings'
import AgentsSettings from './AgentsSettings'
import AppearanceSettings from './AppearanceSettings'

type Tab = 'appearance' | 'agents' | 'ingredients'
const TABS: Tab[] = ['appearance', 'agents', 'ingredients']

export default function SettingsPage() {
  const [tab, setTab] = React.useState<Tab>('appearance')

  return (
    <div className="w-full max-w-2xl mx-auto my-6 rounded-xl bg-background/70 backdrop-blur-md p-8 shadow-lg space-y-6">
      <div className="flex border-b border-border">
        {TABS.map(t => (
          <button
            key={t}
            data-active={String(tab === t)}
            onClick={() => setTab(t)}
            className={`px-4 pb-2 text-sm capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-primary text-foreground font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >{t}</button>
        ))}
      </div>
      {tab === 'appearance'  && <AppearanceSettings />}
      {tab === 'agents'      && <AgentsSettings />}
      {tab === 'ingredients' && <IngredientsSettings />}
    </div>
  )
}
