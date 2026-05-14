export interface IAgent {
  id: number
  name: string
  agentId: string
  isOnline: boolean
  lastSeen: string | null
}

export type AgentContextType = {
  agents: IAgent[]
  dispense: (recipeId: number) => Promise<void>
}
