import { useIngredients } from "../../contexts/IngredientContext";
import { IngredientTable, columns } from "./IngredientTable";
 
export default function IngredientPage() {
  const { ingredients } = useIngredients();

  return (
    <div className="container mx-auto py-10">
      <IngredientTable columns={columns} data={ingredients} />
    </div>
  )
}