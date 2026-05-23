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
  const [renameInputs, setRenameInputs] = React.useState<Record<number, string>>({})
  // pumpSelections[agentId][pumpIndex] = ingredientId | null
  const [pumpSelections, setPumpSelections] = React.useState<Record<number, Record<number, number | null>>>({})

  React.useEffect(() => {
    agents.forEach(a => fetchAgentPumps(a.id))
  }, [agents])

  React.useEffect(() => {
    const inputs: Record<number, string> = {}
    agents.forEach(a => { inputs[a.id] = a.name })
    setRenameInputs(inputs)
  }, [agents])

  React.useEffect(() => {
    const next: Record<number, Record<number, number | null>> = {}
    agents.forEach(agent => {
      const pumps = agentPumps[agent.id] ?? []
      const slots: Record<number, number | null> = {}
      for (let i = 0; i < PUMP_COUNT; i++) {
        slots[i] = pumps.find(p => p.pumpIndex === i)?.ingredientId ?? null
      }
      next[agent.id] = slots
    })
    setPumpSelections(next)
  }, [agents, agentPumps])

  const handleRename = async (agentId: number) => {
    const name = renameInputs[agentId] ?? ''
    if (name.trim()) await updateAgentName(agentId, name.trim())
  }

  const handleSavePumps = async (agentId: number) => {
    const slots = pumpSelections[agentId] ?? {}
    const pumps: IUpdatePumpSlot[] = Array.from({ length: PUMP_COUNT }, (_, i) => ({
      pumpIndex: i,
      ingredientId: slots[i] ?? null,
    }))
    await updateAgentPumps(agentId, pumps)
  }

  const setPumpSlot = (agentId: number, pumpIndex: number, ingredientId: number | null) => {
    setPumpSelections(prev => ({
      ...prev,
      [agentId]: { ...(prev[agentId] ?? {}), [pumpIndex]: ingredientId },
    }))
  }

  return (
    <div className="container mx-auto py-10 space-y-10">
      {agents.length === 0 && <p className="text-muted-foreground">No agents found.</p>}
      {agents.map(agent => (
        <div key={agent.id} className="space-y-4">
          <p className="text-sm font-medium">{agent.name}</p>

          <div className="flex items-center gap-3">
            <Input
              value={renameInputs[agent.id] ?? agent.name}
              onChange={e => setRenameInputs(prev => ({ ...prev, [agent.id]: e.target.value }))}
              className="max-w-xs"
            />
            <Button onClick={() => handleRename(agent.id)}>Rename</Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: PUMP_COUNT }, (_, i) => (
              <div key={i} data-testid={`pump-slot-${i}`} className="flex items-center gap-2">
                <span className="w-16 text-sm text-muted-foreground">Pump {i}</span>
                <select
                  className="flex-1 rounded border px-2 py-1 text-sm bg-background"
                  value={pumpSelections[agent.id]?.[i] != null ? String(pumpSelections[agent.id][i]) : ''}
                  onChange={e => setPumpSlot(agent.id, i, e.target.value === '' ? null : Number(e.target.value))}
                >
                  <option value="">—</option>
                  {ingredients.map(ing => (
                    <option key={ing.id} value={String(ing.id)}>{ing.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <Button onClick={() => handleSavePumps(agent.id)}>Save Pumps</Button>
        </div>
      ))}
    </div>
  )
}
