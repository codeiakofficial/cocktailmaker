import { useIngredients } from '../../contexts/IngredientContext'
import { IngredientTable, columns } from '../ingredients/IngredientTable'

export default function IngredientsSettings() {
  const { ingredients } = useIngredients()
  return <IngredientTable columns={columns} data={ingredients} />
}
