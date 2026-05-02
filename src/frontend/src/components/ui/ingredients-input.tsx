import { Button } from "./button"
import { Input } from "./input"

export function IngredientsInput() {
    return (
        <>
            <Input
                id="input-field-ingredients"
                type="text"
                placeholder="Enter the ingredients"
            />
            <Button variant="outline">Add</Button>
        </>
    )
}