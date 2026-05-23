import './App.css'
import { ThemeProvider } from "./components/theme-provider"
import { ModeToggle } from './components/mode-toggle'
import { RecipeCarousel } from './components/recipes/RecipeCarousel'
import { Separator } from './components/ui/separator'
import { NewRecipeDialog } from './components/recipes/NewRecipeDialog'
import RecipeProvider, { useRecipes } from './contexts/RecipeContext'
import { Button } from './components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import IngredientPage from './components/ingredients/IngredientPage'
import IngredientProvider, { useIngredients } from './contexts/IngredientContext'
import AgentProvider from './contexts/AgentContext'
import { AgentStatusBar } from './components/agents/AgentStatusBar'
import ManageAgentsPage from './components/agents/ManageAgentsPage'
import BottomNav from './components/BottomNav'

function AppContent() {
  const [page, setPage] = useState(0);
  const { fetchRecipes } = useRecipes();
  const { fetchIngredients } = useIngredients();

  const goHome = () => { setPage(0); fetchRecipes(); }
  const goIngredients = () => { setPage(1); fetchIngredients(); }
  const goAgents = () => setPage(2)

  return (
    <div className="h-screen w-screen overflow-hidden">
      <header className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Cocktailmaker 🍹</h1>
          <AgentStatusBar />
        </div>
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" onClick={goHome}>Home</Button>
          <Button variant="ghost" onClick={goIngredients}>Manage Ingredients</Button>
          <Button variant="ghost" onClick={goAgents}>Manage Agents</Button>
          <NewRecipeDialog />
          <ModeToggle />
        </nav>
        <div className="flex md:hidden items-center gap-2">
          <ModeToggle />
        </div>
      </header>
      <Separator className="my-0" />
      <main className={`h-full flex items-center justify-center pt-6 px-20 bg-[url('../../../resources/bg.jpg')] bg-cover max-h-full`}>
        {page === 0 ? <RecipeCarousel /> : page === 1 ? <IngredientPage /> : <ManageAgentsPage />}
      </main>
      <BottomNav
        page={page}
        onHome={goHome}
        onIngredients={goIngredients}
        onAgents={goAgents}
        newRecipeTrigger={
          <NewRecipeDialog trigger={
            <button aria-label="New recipe" className="flex flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground">
              <Plus size={20} />
              New
            </button>
          } />
        }
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