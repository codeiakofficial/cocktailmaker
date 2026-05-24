import * as React from 'react'
import { Button } from '../ui/button'
import IngredientsSettings from './IngredientsSettings'
import AgentsSettings from './AgentsSettings'
import AppearanceSettings from './AppearanceSettings'

type Tab = 'appearance' | 'agents' | 'ingredients'
const TABS: Tab[] = ['appearance', 'agents', 'ingredients']

export default function SettingsPage() {
  const [tab, setTab] = React.useState<Tab>('appearance')

  return (
    <div className="w-full max-w-2xl mx-auto my-6 rounded-xl bg-background/70 backdrop-blur-md p-8 shadow-lg space-y-6">
      <div className="flex gap-2">
        {TABS.map(t => (
          <Button key={t} variant="outline"
            data-active={tab === t ? 'true' : 'false'}
            className={`flex-1 capitalize${tab === t ? ' border-primary text-primary' : ''}`}
            onClick={() => setTab(t)}
          >{t}</Button>
        ))}
      </div>
      {tab === 'appearance'  && <AppearanceSettings />}
      {tab === 'agents'      && <AgentsSettings />}
      {tab === 'ingredients' && <IngredientsSettings />}
    </div>
  )
}
