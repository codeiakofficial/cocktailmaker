import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { Button } from './components/ui/button'
import { ThemeProvider } from "./components/theme-provider"
import { ModeToggle } from './components/mode-toggle'
import { RecipeCarousel } from './components/ui/recipe-carousel'
import { Separator } from './components/ui/separator'
import { RecipeDrawer } from './components/ui/recipe-drawer'

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* Top header bar */}
      <header className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Cocktailmaker 🍹</h1>
        </div>
        <nav className="flex items-center gap-4">
          <RecipeDrawer />
          <ModeToggle />
        </nav>
      </header>
      <Separator className="my-0" />
      {/* Main content */}
      <main className="flex flex-col items-center justify-center pt-6 px-20">
        <RecipeCarousel />
        <h2 className="text-xl font-semibold mt-4">Welcome to Cocktailmaker!</h2>
        <p className="text-center mt-2 text-gray-600 dark:text-gray-400">
          Discover amazing cocktails and create your own!
        </p>
      </main>
    </ThemeProvider>
  )
}

export default App