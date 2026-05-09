import type { ColumnDef } from "@tanstack/react-table"
import type { IIngredient } from "../../contexts/Ingredient"

export const columns: ColumnDef<IIngredient>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "usedInRecipes",
    header: "Used In Recipes",
  },
]