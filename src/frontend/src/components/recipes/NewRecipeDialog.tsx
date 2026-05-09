import { Separator } from "../ui/separator"
import { Button } from "../ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog"
import { Field, FieldDescription, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { useState } from "react"

interface IngredientsInputProps {
    name?: string;
    quantity?: number;
}

export function NewRecipeDialog() {
        const [ingredients, setIngredients] = useState<IngredientsInputProps[]>([]);
        const [page, setPage] = useState<number>(0);
    
        const updateIngredientName = (index: number, value: string) => {
            setIngredients((current) =>
                current.map((ingredient, i) => (i === index ? { ...ingredient, name: value } : ingredient))
            );
        };
    
        const updateIngredientQuantity = (index: number, value: number) => {
            setIngredients((current) =>
                current.map((ingredient, i) => (i === index ? { ...ingredient, quantity: value } : ingredient))
            );
        };
    
        const isFirstPageValid = ingredients.length === 0 || ingredients.some((ing) => !ing.name);
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">New Recipe</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                {/* Title */}
                <DialogHeader>
                    <DialogTitle>New Recipe</DialogTitle>
                    <DialogDescription>
                        Create a new cocktail recipe by filling out the form below.
                    </DialogDescription>
                </DialogHeader>
                {/* Recipe Name */}
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
                <Separator className="my-0" />
                {/* Ingredients */}
                <DialogTitle>Ingredients</DialogTitle>
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
                                onChange={(event) => updateIngredientName(index, event.target.value)}
                                placeholder="Enter the ingredients"
                            />
                            {/* Remove button */}
                            <Button
                                variant="ghost"
                                tabIndex={-1}
                                onClick={() => setIngredients((current) => current.filter((_, i) => i !== index))}
                            >
                                ✕
                            </Button>
                        </Field>) : (
                        <Field orientation="horizontal" key={index} className="gap-2">
                            <label className="w-full">
                                {ingredient.name}
                            </label>
                            {/* Ingredient quantity */}
                            <Input
                                className="max-w-[10vh]"
                                value={ingredient.quantity}
                                onChange={(event) => updateIngredientQuantity(index, parseFloat(event.target.value) || 0)}
                            />
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
                        </Button><Button disabled={isFirstPageValid} onClick={() => { setPage(1); }}>
                            Next
                        </Button>
                    </Field>) : (
                    <Field orientation="horizontal" className="gap-2 w-full justify-end">
                        {/* Navigation Second Page */}
                        <Button variant="secondary" onClick={() => { setPage(0); }}>
                            Return
                        </Button>
                        <Button disabled={ingredients.length === 0 || ingredients.some((ing) => !ing.name)} onClick={() => { setPage(1); }}>
                            Save
                        </Button>
                    </Field>)}
            </Field>
            </DialogContent>
        </Dialog>
    )
}