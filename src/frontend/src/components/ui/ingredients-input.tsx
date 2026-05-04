import { useState } from "react";
import { Button } from "./button"
import { Input } from "./input"
import { Field } from "./field";

export function IngredientsInput() {
    const [ingredients, setIngredients] = useState<string[]>([]);

    const updateIngredient = (index: number, value: string) => {
        setIngredients((current) =>
            current.map((ingredient, i) => (i === index ? value : ingredient))
        );
    };

    return (
        <>
            {ingredients.map((ingredient, index) => (
                <Field orientation="horizontal" key={index} className="gap-2">
                    <Input
                        id={`input-field-ingredients-${index}`}
                        type="text"
                        value={ingredient}
                        onChange={(event) => updateIngredient(index, event.target.value)}
                        placeholder="Enter the ingredients"
                    />
                    <Button
                        variant="ghost"
                        onClick={() => setIngredients((current) => current.filter((_, i) => i !== index))}
                    >
                        ✕
                    </Button>
                </Field>
            ))}

            <Button variant="outline" onClick={() => setIngredients((current) => [...current, ""])}>
                Add
            </Button>
        </>
    )
}