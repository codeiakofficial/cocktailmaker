import { useState } from "react";
import { Button } from "./button"
import { Input } from "./input"

export function IngredientsInput() {
    const [ingredients, setIngredients] = useState<string[]>([]);

    return (
        <>
            {ingredients.map((_, index) => (
                <Input
                    key={index}
                    id={`input-field-ingredients-${index}`}
                    type="text"
                    placeholder="Enter the ingredients"
                />
            ))}
            <Button variant="outline" onClick={() => setIngredients([...ingredients, ""])}>
                Add
            </Button>
        </>
    )
}