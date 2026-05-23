import * as React from 'react'
import { useAgents } from '../../contexts/AgentContext'
import { useIngredients } from '../../contexts/IngredientContext'
import type { IUpdatePumpSlot } from '../../contexts/Agent'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const PUMP_COUNT = 8

export default function ManageAgentsPage() {
  const { agents, agentPumps, fetchAgentPumps, updateAgentName, updateAgentPumps } = useAgents()
  const { ingredients } = useIngredients()
  const [selectedAgentId, setSelectedAgentId] = React.useState<number | null>(null)
  const [renameInputs, setRenameInputs] = React.useState<Record<number, string>>({})
  const [pumpSelections, setPumpSelections] = React.useState<Record<number, number | null>>({})

  const selectedAgent = agents.find(a => a.id === selectedAgentId) ?? agents[0] ?? null

  React.useEffect(() => {
    if (selectedAgent) {
      fetchAgentPumps(selectedAgent.id)
    }
  }, [selectedAgent?.id])

  React.useEffect(() => {
    const inputs: Record<number, string> = {}
    agents.forEach(a => { inputs[a.id] = a.name })
    setRenameInputs(inputs)
  }, [agents])

  React.useEffect(() => {
    if (!selectedAgent) return
    const pumps = agentPumps[selectedAgent.id] ?? []
    const selections: Record<number, number | null> = {}
    for (let i = 0; i < PUMP_COUNT; i++) {
      const slot = pumps.find(p => p.pumpIndex === i)
      selections[i] = slot?.ingredientId ?? null
    }
    setPumpSelections(selections)
  }, [selectedAgent?.id, agentPumps])

  const handleRename = async (agentId: number) => {
    const name = renameInputs[agentId] ?? ''
    if (name.trim()) await updateAgentName(agentId, name.trim())
  }

  const handleSavePumps = async () => {
    if (!selectedAgent) return
    const pumps: IUpdatePumpSlot[] = Array.from({ length: PUMP_COUNT }, (_, i) => ({
      pumpIndex: i,
      ingredientId: pumpSelections[i] ?? null,
    }))
    await updateAgentPumps(selectedAgent.id, pumps)
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Agents</h2>
        {agents.length === 0 && <p className="text-muted-foreground">No agents found.</p>}
        {agents.map(agent => (
          <div key={agent.id} className="space-y-1">
            <p className="text-sm font-medium">{agent.name}</p>
            <div className="flex items-center gap-3">
            <Input
              value={renameInputs[agent.id] ?? agent.name}
              onChange={e => setRenameInputs(prev => ({ ...prev, [agent.id]: e.target.value }))}
              className="max-w-xs"
            />
            <Button onClick={() => handleRename(agent.id)}>Rename</Button>
            <Button
              variant="outline"
              onClick={() => setSelectedAgentId(agent.id)}
            >
              Configure Pumps
            </Button>
            </div>
          </div>
        ))}
      </section>

      {selectedAgent && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Pumps — {selectedAgent.name}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: PUMP_COUNT }, (_, i) => (
              <div key={i} data-testid={`pump-slot-${i}`} className="flex items-center gap-2">
                <span className="w-16 text-sm text-muted-foreground">Pump {i}</span>
                <select
                  className="flex-1 rounded border px-2 py-1 text-sm bg-background"
                  value={pumpSelections[i] != null ? String(pumpSelections[i]) : ''}
                  onChange={e =>
                    setPumpSelections(prev => ({
                      ...prev,
                      [i]: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                >
                  <option value="">—</option>
                  {ingredients.map(ing => (
                    <option key={ing.id} value={String(ing.id)}>
                      {ing.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <Button onClick={handleSavePumps}>Save Pumps</Button>
        </section>
      )}
    </div>
  )
}
