import './App.css'
import { ThemeProvider } from "./components/theme-provider"
import { ModeToggle } from './components/mode-toggle'
import { RecipeCarousel } from './components/recipes/RecipeCarousel'
import { Separator } from './components/ui/separator'
import { NewRecipeDialog } from './components/recipes/NewRecipeDialog'

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* Top header bar */}
      <header className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Cocktailmaker 🍹</h1>
        </div>
        <nav className="flex items-center gap-4">
          <NewRecipeDialog />
          <ModeToggle />
        </nav>
      </header>
      <Separator className="my-0" />
      {/* Main content */}
      <main className={`flex flex-col items-center justify-center pt-6 px-20 bg-[url('../../../resources/bg.jpg')] bg-cover min-h-screen`}>
        <RecipeCarousel />
      </main>
    </ThemeProvider>
  )
}

export default App