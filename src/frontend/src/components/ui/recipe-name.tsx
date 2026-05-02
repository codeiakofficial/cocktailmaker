import {
  Field,
  FieldDescription,
  FieldLabel,
} from "./field"
import { Input } from "./input"

export function RecipeName() {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="input-field-name">Name</FieldLabel>
        <Input
          id="input-field-name"
          type="text"
          placeholder="Enter the recipe name"
        />
        <FieldDescription>
          Choose a unique name for your recipe.
        </FieldDescription>
      </Field>
    </>
  )
}
