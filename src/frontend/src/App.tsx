import './App.css'
import { ThemeProvider } from "./components/theme-provider"
import { RecipeCarousel } from './components/recipes/RecipeCarousel'
import { Separator } from './components/ui/separator'
import { NewRecipeDialog } from './components/recipes/NewRecipeDialog'
import RecipeProvider, { useRecipes } from './contexts/RecipeContext'
import { Button } from './components/ui/button'
import { Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import IngredientProvider, { useIngredients } from './contexts/IngredientContext'
import AgentProvider from './contexts/AgentContext'
import { AgentStatusBar } from './components/agents/AgentStatusBar'
import IngredientsSettings from './components/settings/IngredientsSettings'
import AgentsSettings from './components/settings/AgentsSettings'
import SettingsPage from './components/settings/SettingsPage'
import BottomNav from './components/BottomNav'
import { loadColorTheme, applyColorTheme } from './contexts/ColorTheme'

function AppContent() {
  const [page, setPage] = useState(0);
  const { fetchRecipes } = useRecipes();
  const { fetchIngredients } = useIngredients();

  useEffect(() => {
    applyColorTheme(loadColorTheme())
  }, [])

  const goHome = () => { setPage(0); fetchRecipes(); }
  const goIngredients = () => { setPage(1); fetchIngredients(); }
  const goAgents = () => setPage(2)
  const goSettings = () => setPage(3)

  return (
    <div className="h-screen w-screen overflow-hidden">
      <header className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--title-color)' }}>Cocktailmaker 🍹</h1>
          <AgentStatusBar />
        </div>
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" onClick={goHome}>Home</Button>
          <Button variant="ghost" onClick={goIngredients}>Manage Ingredients</Button>
          <Button variant="ghost" onClick={goAgents}>Manage Agents</Button>
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
      <main className={`h-full flex bg-[url('../../../resources/bg.jpg')] bg-cover max-h-full ${page === 3 ? 'items-start justify-center overflow-y-auto py-6 px-4' : 'items-center justify-center pt-6 px-20'}`}>
        {page === 0 ? <RecipeCarousel /> :
         page === 1 ? <IngredientsSettings /> :
         page === 2 ? <AgentsSettings /> :
         <SettingsPage />}
      </main>
      <BottomNav
        page={page}
        onHome={goHome}
        onIngredients={goIngredients}
        onAgents={goAgents}
        onSettings={goSettings}
      />
    </div>
  );
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
  );
}

export default App
