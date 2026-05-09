import { useState } from "react";
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Field } from "../ui/field";

interface IngredientsInputProps {
    name?: string;
    quantity?: number;
}

export function RecipeIngredientsInput() {
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
                    {page === 0 ? (
                        <Field orientation="horizontal" key={index} className="gap-2">
                            {/* Ingredient name */}
                            <Input
                                id={`input-field-ingredients-${index}`}
                                type="text"
                                value={ingredient.name}
                                onChange={(event) => updateIngredient(index, event.target.value)}
                                placeholder="Enter the ingredients"
                            />
                            {/* Remove button */}
                            <Button
                                variant="ghost"
                                tabIndex={-1}
                                onClick={() => setIngredients((current) => current.filter((_, i) => i !== index))}
                            >
                                ✕
                            </Button></Field>) : (
                        <Field orientation="horizontal" key={index} className="gap-2">
                            <label className="w-full">
                                {ingredient.name}
                            </label>
                            {/* Ingredient quantity */}
                            <Input className="max-w-[10vh]" hidden={page === 0} />
                            <label className="mr-2 text-sm text-muted-foreground">
                                ml
                            </label>
                        </Field>)}
                </Field>
            ))}
            <Field orientation="horizontal" className="gap-2 w-full justify-end">
                {page === 0 ? (
                    <Field orientation="horizontal" className="gap-2 w-full justify-end">
                        {/* Navigation First Page */}
                        <Button variant="secondary" onClick={() => setIngredients((current) => [...current, { name: "", quantity: 0 }])}>
                            Add
                        </Button><Button disabled={ingredients.length === 0} onClick={() => { setPage(1); }}>
                            Next
                        </Button>
                    </Field>) : (
                    <Field orientation="horizontal" className="gap-2 w-full justify-end">
                        {/* Navigation Second Page */}
                        <Button variant="secondary" onClick={() => { setPage(0); }}>
                            Return
                        </Button>
                        <Button disabled={ingredients.length === 0} onClick={() => { setPage(1); }}>
                            Save
                        </Button>
                    </Field>)}
            </Field>
        </>
    )
}