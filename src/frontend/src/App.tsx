import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { Button } from './components/ui/button'
import { ThemeProvider } from "./components/theme-provider"
import { ModeToggle } from './components/mode-toggle'
import { CarouselDemo } from './components/ui/recipe-carousel'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* Top header bar */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Cocktailmaker 🍹</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="outline">Button</Button>
          <ModeToggle />
        </nav>
      </header>
      {/* Main content */}
      <main className="flex flex-col items-center justify-center p-4">
        <CarouselDemo />
        <h2 className="text-xl font-semibold mt-4">Welcome to Cocktailmaker!</h2>
        <p className="text-center mt-2 text-gray-600 dark:text-gray-400">
          Discover amazing cocktails and create your own!
        </p>
      </main>
    </ThemeProvider>
  )
}

export default App