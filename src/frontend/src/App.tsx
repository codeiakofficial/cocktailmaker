import { ThemeProvider } from "./components/theme-provider"
import { RecipeCarousel } from './components/recipes/RecipeCarousel'
import { Separator } from './components/ui/separator'
import { NewRecipeDialog } from './components/recipes/NewRecipeDialog'
import RecipeProvider, { useRecipes } from './contexts/RecipeContext'
import { Button } from './components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import IngredientProvider, { useIngredients } from './contexts/IngredientContext'
import AgentProvider, { useAgents } from './contexts/AgentContext'
import { AgentStatusBar } from './components/agents/AgentStatusBar'
import SettingsPage from './components/settings/SettingsPage'
import BottomNav from './components/BottomNav'
import { CleanViewToggle } from './components/ui/CleanViewToggle'
import { ParticleOverlay } from './components/ui/ParticleOverlay'

function AppContent() {
  const [page, setPage] = useState(0)
  const { fetchRecipes } = useRecipes()
  const { fetchIngredients } = useIngredients()
  const { fetchAgents } = useAgents()

  const goHome     = () => { setPage(0); fetchRecipes() }
  const goSettings = () => { setPage(1); fetchIngredients(); fetchAgents() }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative">
      {/* Background layer — vignette frost applied here via CSS when html.vignette */}
      <div className="bg-layer absolute inset-0 bg-cover bg-center -z-10" style={{ backgroundImage: 'var(--bg-image-url)' }} />
      {/* Vignette overlay — sits between background and content; backdrop-filter blurs only the bg layer */}
      <div className="vignette-overlay absolute inset-0 pointer-events-none" style={{ zIndex: -1 }} />
      {/* Particle overlay — above vignette (z:0), below content (z:1); driven by html.animations class */}
      <ParticleOverlay />

      <header className="relative flex items-center justify-between p-3 backdrop-blur-md" style={{ backgroundColor: 'var(--header-bg)', zIndex: 1 }}>
        <div className="cv-hide flex items-center gap-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--title-color)' }}>Cocktailmaker 🍹</h1>
          <AgentStatusBar />
        </div>
        <nav className="cv-hide hidden md:flex items-center gap-4">
          <Button variant="ghost" onClick={goHome}>Home</Button>
          <Button variant="ghost" onClick={goSettings}>Settings</Button>
          <NewRecipeDialog />
        </nav>
        <div className="cv-hide flex md:hidden items-center gap-2">
          <NewRecipeDialog trigger={
            <button aria-label="New recipe" className="rounded-md p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Plus size={20} />
            </button>
          } />
        </div>
        <CleanViewToggle />
      </header>
      <Separator className="cv-hide my-0" />
      <main className="cv-hide relative flex-1 overflow-y-auto pb-16 md:pb-0" style={{ zIndex: 1 }}>
        {page === 0
          ? <div className="flex min-h-full items-center justify-center px-20 pt-6"><RecipeCarousel /></div>
          : <SettingsPage />
        }
      </main>
      <div className="cv-hide" style={{ zIndex: 1 }}>
        <BottomNav page={page} onHome={goHome} onSettings={goSettings} />
      </div>
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
