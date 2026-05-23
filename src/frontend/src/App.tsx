import './App.css'
import { ThemeProvider } from "./components/theme-provider"
import { ModeToggle } from './components/mode-toggle'
import { RecipeCarousel } from './components/recipes/RecipeCarousel'
import { Separator } from './components/ui/separator'
import { NewRecipeDialog } from './components/recipes/NewRecipeDialog'
import RecipeProvider, { useRecipes } from './contexts/RecipeContext'
import { Button } from './components/ui/button'
import { useState } from 'react'
import IngredientPage from './components/ingredients/IngredientPage'
import IngredientProvider, { useIngredients } from './contexts/IngredientContext'
import AgentProvider from './contexts/AgentContext'
import { AgentStatusBar } from './components/agents/AgentStatusBar'
import ManageAgentsPage from './components/agents/ManageAgentsPage'

function AppContent() {
  const [page, setPage] = useState(0);
  const { fetchRecipes } = useRecipes();
  const { fetchIngredients } = useIngredients();

  return (
    <div className="h-screen w-screen overflow-hidden">
      <header className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Cocktailmaker 🍹</h1>
          <AgentStatusBar />
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => { setPage(0); fetchRecipes(); }}>
            Home
          </Button>
          <Button variant="ghost" onClick={() => { setPage(1); fetchIngredients(); }}>
            Manage Ingredients
          </Button>
          <Button variant="ghost" onClick={() => setPage(2)}>
            Manage Agents
          </Button>
          <NewRecipeDialog />
          <ModeToggle />
        </nav>
      </header>
      <Separator className="my-0" />
      <main className={`h-full flex items-center justify-center pt-6 px-20 bg-[url('../../../resources/bg.jpg')] bg-cover max-h-full`}>
        {page === 0 ? <RecipeCarousel /> : page === 1 ? <IngredientPage /> : <ManageAgentsPage />}
      </main>
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