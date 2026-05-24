import { ThemeProvider } from "./components/theme-provider"
import { RecipeCarousel } from './components/recipes/RecipeCarousel'
import { Separator } from './components/ui/separator'
import { NewRecipeDialog } from './components/recipes/NewRecipeDialog'
import RecipeProvider, { useRecipes } from './contexts/RecipeContext'
import { Button } from './components/ui/button'
import { Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import IngredientProvider, { useIngredients } from './contexts/IngredientContext'
import AgentProvider, { useAgents } from './contexts/AgentContext'
import { AgentStatusBar } from './components/agents/AgentStatusBar'
import SettingsPage from './components/settings/SettingsPage'
import BottomNav from './components/BottomNav'
import { applyHeaderStyle, restoreAppearance } from './components/settings/AppearanceSettings'

function AppContent() {
  const [page, setPage] = useState(0)
  const { fetchRecipes } = useRecipes()
  const { fetchIngredients } = useIngredients()
  const { fetchAgents } = useAgents()

  useEffect(() => {
    restoreAppearance()
    applyHeaderStyle(localStorage.getItem('vite-ui-header-style') === 'blur' ? 'blur' : 'solid')
  }, [])

  const goHome     = () => { setPage(0); fetchRecipes() }
  const goSettings = () => { setPage(1); fetchIngredients(); fetchAgents() }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[url('../../../resources/bg.jpg')] bg-cover">
      <header className="flex items-center justify-between p-3 backdrop-blur-md" style={{ backgroundColor: 'var(--header-bg)' }}>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--title-color)' }}>Cocktailmaker 🍹</h1>
          <AgentStatusBar />
        </div>
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" onClick={goHome}>Home</Button>
          <Button variant="ghost" onClick={goSettings}>Settings</Button>
          <NewRecipeDialog />
        </nav>
        <div className="flex md:hidden items-center gap-2">
          <NewRecipeDialog trigger={
            <button aria-label="New recipe" className="rounded-md p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Plus size={20} />
            </button>
          } />
        </div>
      </header>
      <Separator className="my-0" />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {page === 0
          ? <div className="flex min-h-full items-center justify-center px-20 pt-6"><RecipeCarousel /></div>
          : <SettingsPage />
        }
      </main>
      <BottomNav page={page} onHome={goHome} onSettings={goSettings} />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AgentProvider>
        <RecipeProvider>
          <IngredientProvider>
            <AppContent />
          </IngredientProvider>
        </RecipeProvider>
      </AgentProvider>
    </ThemeProvider>
  )
}

export default App
