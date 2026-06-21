import { ThemeProvider } from "./components/theme-provider"
import { RecipeCarousel } from './components/recipes/RecipeCarousel'
import { Separator } from './components/ui/separator'
import { NewRecipeDialog } from './components/recipes/NewRecipeDialog'
import RecipeProvider, { useRecipes } from './contexts/RecipeContext'
import { Button } from './components/ui/button'
import { Plus, Home, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import IngredientProvider, { useIngredients } from './contexts/IngredientContext'
import AgentProvider, { useAgents } from './contexts/AgentContext'
import { AgentStatusBar } from './components/agents/AgentStatusBar'
import SettingsPage from './components/settings/SettingsPage'
import BottomNav from './components/BottomNav'
import { CleanViewToggle } from './components/ui/CleanViewToggle'
import { ParticleOverlay } from './components/ui/ParticleOverlay'

function AppContent() {
  const [page,      setPage]      = useState(0)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('vite-ui-sidebar-collapsed') === 'true')
  const { fetchRecipes }    = useRecipes()
  const { fetchIngredients } = useIngredients()
  const { fetchAgents }     = useAgents()

  const goHome     = () => { setPage(0); fetchRecipes() }
  const goSettings = () => { setPage(1); fetchIngredients(); fetchAgents() }

  const toggleSidebar = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('vite-ui-sidebar-collapsed', String(next))
  }

  const navItem = (label: string, Icon: React.ElementType, active: boolean, onClick: () => void) => (
    <button
      key={label}
      aria-label={label}
      title={collapsed ? label : undefined}
      onClick={onClick}
      className={`flex items-center w-full rounded-lg text-sm transition-colors ${
        collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'
      } ${
        active
          ? 'bg-primary/10 text-foreground font-medium'
          : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
      }`}
    >
      <Icon size={18} />
      {!collapsed && label}
    </button>
  )

  return (
    <div className="h-screen w-screen flex overflow-hidden relative">
      <div className="bg-layer absolute inset-0 bg-cover bg-center -z-10" style={{ backgroundImage: 'var(--bg-image-url)' }} />
      <div className="frost-overlay absolute inset-0 pointer-events-none" style={{ zIndex: -1 }} />
      <ParticleOverlay />

      {/* Desktop sidebar */}
      <aside
        className={`cv-hide hidden md:flex flex-col shrink-0 border-r border-border backdrop-blur-md transition-[width] duration-200 ease-in-out overflow-hidden ${collapsed ? 'w-14' : 'w-52'}`}
        style={{ backgroundColor: 'var(--header-bg)', zIndex: 1 }}
      >
        <div className={`flex items-center py-4 ${collapsed ? 'justify-center px-0' : 'px-4'}`}>
          {collapsed
            ? <span className="text-xl select-none">🍹</span>
            : <h1 className="text-xl font-bold truncate" style={{ color: 'var(--title-color)' }}>Cocktailmaker 🍹</h1>
          }
        </div>
        <Separator />

        <nav className="flex flex-col gap-1 p-2 pt-3">
          {navItem('Home',     Home,     page === 0, goHome)}
          {navItem('Settings', Settings, page === 1, goSettings)}
        </nav>

        <div className="flex-1" />

        <div className="p-2">
          {collapsed
            ? <NewRecipeDialog trigger={
                <button
                  aria-label="New recipe"
                  title="New Recipe"
                  className="flex items-center justify-center w-full py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <Plus size={18} />
                </button>
              } />
            : <NewRecipeDialog trigger={
                <Button variant="outline" className="w-full gap-2 justify-start">
                  <Plus size={16} /> New Recipe
                </Button>
              } />
          }
        </div>

        {!collapsed && (
          <>
            <Separator />
            <div className="p-3">
              <AgentStatusBar />
            </div>
          </>
        )}

        <Separator />
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex items-center py-3 text-muted-foreground hover:text-foreground transition-colors ${collapsed ? 'justify-center' : 'justify-end px-4 gap-2 text-xs'}`}
        >
          {!collapsed && 'Collapse'}
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </aside>

      {/* Content column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile header — title + clean-view toggle only */}
        <header
          className="md:hidden flex items-center justify-between p-3"
          style={{ zIndex: 1 }}
        >
          <h1 className="cv-hide text-2xl font-bold" style={{ color: 'var(--title-color)' }}>Cocktailmaker 🍹</h1>
          <CleanViewToggle />
        </header>

        <main className="cv-hide relative flex-1 overflow-y-auto pb-16 md:pb-0" style={{ zIndex: 1 }}>
          {page === 0
            ? <div className="pt-4 md:flex md:min-h-full md:items-center md:justify-center md:px-16 md:pt-6"><RecipeCarousel /></div>
            : <SettingsPage />
          }
        </main>

        <div className="cv-hide" style={{ zIndex: 1 }}>
          <BottomNav page={page} onHome={goHome} onSettings={goSettings} centerAction={
            <NewRecipeDialog trigger={
              <button aria-label="New recipe" className="flex flex-col items-center gap-0.5 py-2 text-xs text-primary transition-colors">
                <Plus size={20} />
                New Recipe
              </button>
            } />
          } />
        </div>
      </div>

      {/* Desktop: clean-view toggle floats top-right, outside cv-hide */}
      <div className="hidden md:block absolute top-3 right-3" style={{ zIndex: 2 }}>
        <CleanViewToggle />
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
