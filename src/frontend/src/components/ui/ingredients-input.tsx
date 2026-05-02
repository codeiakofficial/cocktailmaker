import { useState } from "react";
import { Button } from "./button"
import { Input } from "./input"
import { Field } from "./field";

export function IngredientsInput() {
    const [ingredients, setIngredients] = useState<string[]>([]);

    return (
        <>
            {ingredients.map((_, index) => (
                <>
                    <Field orientation="horizontal" key={index} className="gap-2">
                        <Input
                            key={index}
                            id={`input-field-ingredients-${index}`}
                            type="text"
                            placeholder="Enter the ingredients"
                        />
                        <Button variant="ghost" onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))}>
                            Remove
                        </Button>
                    </Field >
                </>
            ))
            }

            <Button variant="outline" onClick={() => setIngredients([...ingredients, ""])}>
                Add
            </Button>
        </>
    )
}