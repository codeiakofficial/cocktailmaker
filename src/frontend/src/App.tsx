import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { Button } from './components/ui/button'
import { ThemeProvider } from "./components/theme-provider"
import { ModeToggle } from './components/mode-toggle'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* Top header bar */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Cocktailmaker 🍹</h1>
        </div>
        <nav className="flex items-center gap-4">
          <ModeToggle />
        </nav>
      </header>
      
      <Button>
        Hello World
      </Button>
    </ThemeProvider>
  )
}

export default App