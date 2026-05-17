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
    if (url.includes('/agents')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    if (url.includes('/recipes')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    if (url.includes('/ingredients')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  }))
})

const recipeCalls = () =>
  vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes('/recipes')).length

const ingredientCalls = () =>
  vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes('/ingredients')).length

describe('App — page navigation re-fetches data', () => {
  test('re-fetches recipes when navigating back to Home', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('button', { name: 'Home' })

    const countAfterMount = recipeCalls()

    await user.click(screen.getByRole('button', { name: 'Manage Ingredients' }))
    await user.click(screen.getByRole('button', { name: 'Home' }))

    expect(recipeCalls()).toBeGreaterThan(countAfterMount)
  })

  test('re-fetches ingredients when navigating to Manage Ingredients a second time', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('button', { name: 'Home' })

    await user.click(screen.getByRole('button', { name: 'Manage Ingredients' }))
    const countAfterFirstVisit = ingredientCalls()

    await user.click(screen.getByRole('button', { name: 'Home' }))
    await user.click(screen.getByRole('button', { name: 'Manage Ingredients' }))

    expect(ingredientCalls()).toBeGreaterThan(countAfterFirstVisit)
  })
})
