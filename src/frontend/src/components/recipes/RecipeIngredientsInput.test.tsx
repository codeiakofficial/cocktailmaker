import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { describe, expect, test } from 'vitest'
import { RecipeIngredientsInput } from './RecipeIngredientsInput'

test('loads and displays greeting', async () => {
  // ARRANGE
  render(<RecipeIngredientsInput />)

  // // ACT
  // await userEvent.click(screen.getByText('Load Greeting'))
  // await screen.findByRole('heading')

  // // ASSERT
  // expect(screen.getByRole('heading')).toHaveTextContent('hello there')
  // expect(screen.getByRole('button')).toBeDisabled()
})