import * as React from 'react'
import { Button } from '../ui/button'
import IngredientsSettings from './IngredientsSettings'
import AgentsSettings from './AgentsSettings'
import AppearanceSettings from './AppearanceSettings'

type Tab = 'ingredients' | 'agents' | 'appearance'
const TABS: Tab[] = ['ingredients', 'agents', 'appearance']

export default function SettingsPage() {
  const [tab, setTab] = React.useState<Tab>('ingredients')

  return (
    <div className="w-full max-w-2xl max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl bg-background/70 backdrop-blur-md p-8 shadow-lg space-y-6">
      <div className="flex gap-2">
        {TABS.map(t => (
          <Button key={t} variant="outline"
            data-active={tab === t ? 'true' : 'false'}
            className={`flex-1 capitalize${tab === t ? ' border-primary text-primary' : ''}`}
            onClick={() => setTab(t)}
          >{t}</Button>
        ))}
      </div>
      {tab === 'ingredients' && <IngredientsSettings />}
      {tab === 'agents'      && <AgentsSettings />}
      {tab === 'appearance'  && <AppearanceSettings />}
    </div>
  )
}
