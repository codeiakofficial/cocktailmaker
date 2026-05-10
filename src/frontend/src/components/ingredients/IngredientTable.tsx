import type {
  ColumnDef
} from "@tanstack/react-table"

import type { IIngredient } from "../../contexts/Ingredient"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Button } from "../ui/button"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function IngredientTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleDelete = (id: number) => {
    alert(`Delete ingredient with ID: ${id}`);
  };

  return (
    <div className="overflow-hidden rounded-md border backdrop-blur-sm">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map(
                  (cell) => {
                    const ingredient = row.original as IIngredient;
                    return cell.column.id === "remove" && ingredient.usedInRecipes.length === 0
                      ? (
                        // remove button cell
                        <TableCell key={cell.id}>
                          <Button variant="ghost"
                            onClick={() => handleDelete(ingredient.id)}
                          >
                            ✕
                          </Button>
                        </TableCell>)
                      : (
                        // default cell
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>)
                  })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

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
  {
    accessorKey: "remove",
    header: "Remove",
  }
]