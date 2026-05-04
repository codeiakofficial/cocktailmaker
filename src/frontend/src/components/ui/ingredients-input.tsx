import { useState } from "react";
import { Button } from "./button"
import { Input } from "./input"
import { Field } from "./field";

interface IngredientsInputProps {
    name?: string;
    quantity?: number;
}

export function IngredientsInput() {
    const [ingredients, setIngredients] = useState<IngredientsInputProps[]>([]);
    const [page, setPage] = useState<number>(0);

    const updateIngredient = (index: number, value: string) => {
        setIngredients((current) =>
            current.map((ingredient, i) => (i === index ? { ...ingredient, name: value } : ingredient))
        );
    };

    return (
        <>
            {ingredients.map((ingredient, index) => (
                <Field orientation="horizontal" key={index} className="gap-2">
                    <label className="mr-2 text-sm text-muted-foreground">
                        {index + 1}.
                    </label>
                    <Input
                        hidden={page === 1}
                        id={`input-field-ingredients-${index}`}
                        type="text"
                        value={ingredient.name}
                        onChange={(event) => updateIngredient(index, event.target.value)}
                        placeholder="Enter the ingredients"
                    />
                    <label hidden={page === 0}>
                        {ingredient.name}
                    </label>
                    <Button
                        variant="ghost"
                        tabIndex={-1}
                        hidden={page === 1}
                        onClick={() => setIngredients((current) => current.filter((_, i) => i !== index))}
                    >
                        ✕
                    </Button>
                    <Input className="max-w-[10vh]" hidden={page === 0} value={ingredient.quantity} />
                </Field>
            ))}

            <Field orientation="horizontal" className="gap-2 w-full justify-end">
                <Button variant="secondary" hidden={page === 1} onClick={() => setIngredients((current) => [...current, { name: "", quantity: 0 }])}>
                    Add
                </Button>
                <Button variant="secondary" hidden={page === 0} onClick={() => {setPage(0);}}>
                    Return
                </Button>
                <Button disabled={ingredients.length === 0} hidden={page === 1} onClick={() => {setPage(1);}}>
                    Next
                </Button>
                <Button disabled={ingredients.length === 0} hidden={page === 0} onClick={() => {setPage(1);}}>
                    Save
                </Button>
            </Field>
        </>
    )
}