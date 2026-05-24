import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import App from './App'

class MockEventSource {
  addEventListener = vi.fn()
  close = vi.fn()
  onerror = null
}
vi.stubGlobal('EventSource', MockEventSource)

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  })
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/agents'))      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    if (url.includes('/recipes'))     return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    if (url.includes('/ingredients')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  }))
})

const recipeCalls = () =>
  vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes('/recipes')).length

const ingredientCalls = () =>
  vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes('/ingredients')).length

const agentCalls = () =>
  vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes('/agents')).length

// jsdom renders both desktop nav and mobile BottomNav — target desktop nav with [0]
const navButton = (name: string) => screen.getAllByRole('button', { name }).at(0)!

describe('App — page navigation', () => {
  test('shows Home by default', async () => {
    render(<App />)
    await screen.findAllByRole('button', { name: /^home$/i })
    expect(navButton('Home')).toBeInTheDocument()
  })

  test('navigating to Settings and back to Home re-fetches recipes', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findAllByRole('button', { name: /^home$/i })

    const countAfterMount = recipeCalls()
    await user.click(navButton('Settings'))
    await user.click(navButton('Home'))

    expect(recipeCalls()).toBeGreaterThan(countAfterMount)
  })

  test('navigating to Settings fetches ingredients and agents', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findAllByRole('button', { name: /^home$/i })

    const ingBefore = ingredientCalls()
    const agentBefore = agentCalls()

    await user.click(navButton('Settings'))

    expect(ingredientCalls()).toBeGreaterThan(ingBefore)
    expect(agentCalls()).toBeGreaterThan(agentBefore)
  })
})
