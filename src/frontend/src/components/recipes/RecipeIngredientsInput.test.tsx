import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { describe, expect, test } from 'vitest'
import { RecipeIngredientsInput } from './RecipeIngredientsInput'

test('add ingredient, enter name and verify it appears in the list', async () => {
  const user = userEvent.setup()
  // ARRANGE
  await act(async () => {
    render(<RecipeIngredientsInput />)
  });

  // ACT
  await act(async () => {
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await screen.getByPlaceholderText('Enter the ingredients')
    const input = screen.getByPlaceholderText('Enter the ingredients')
    // Type ingredient name
    await user.type(input, 'Vodka')
  })

  // Verify it appears
  expect(screen.getByDisplayValue('Vodka')).toBeInTheDocument()
})