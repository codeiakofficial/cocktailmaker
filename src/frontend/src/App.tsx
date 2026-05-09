import './App.css'
import { ThemeProvider } from "./components/theme-provider"
import { ModeToggle } from './components/mode-toggle'
import { RecipeCarousel } from './components/recipes/RecipeCarousel'
import { Separator } from './components/ui/separator'
import { NewRecipeDialog } from './components/recipes/NewRecipeDialog'
import RecipeProvider from './contexts/RecipeContext'
import { Button } from './components/ui/button'
import { useState } from 'react'
import IngredientPage from './components/ingredients/IngredientPage'
import IngredientProvider from './contexts/IngredientContext'

function App() {
  const [page, setPage] = useState(0);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RecipeProvider>
          {/* Top header bar */}
          <header className="flex items-center justify-between p-3">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Cocktailmaker 🍹</h1>
            </div>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setPage(0)}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => setPage(1)}>
                Manage Ingredients
              </Button>
              <NewRecipeDialog />
              <ModeToggle />
            </nav>
          </header>
          <Separator className="my-0" />
          {/* Main content */}
          <main className={`h-full flex items-center justify-center pt-6 px-20 bg-[url('../../../resources/bg.jpg')] bg-cover max-h-full`}>
            {page === 0 ? <RecipeCarousel /> :
              <IngredientProvider>
                <IngredientPage />
              </IngredientProvider>}
          </main>
        </RecipeProvider>
      </ThemeProvider>
    </div>
  )
}

export default App