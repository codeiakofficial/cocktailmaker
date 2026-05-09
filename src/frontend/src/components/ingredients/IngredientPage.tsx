import { useIngredients } from "../../contexts/IngredientContext";
import { columns } from "./IngredientColumns"
import { IngredientList } from "./IngredientList";
 
export default function IngredientPage() {
  const { ingredients } = useIngredients();

  return (
    <div className="container mx-auto py-10">
      <IngredientList columns={columns} data={ingredients} />
    </div>
  )
}