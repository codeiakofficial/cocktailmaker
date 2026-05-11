import { Separator } from "../ui/separator"
import { Button } from "../ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog"
import { Field, FieldDescription, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { useState, useEffect } from "react"
import { useRecipes } from "../../contexts/RecipeContext"
import type { IRecipe } from "../../contexts/Recipe"

interface RecipeDialogProps {
    recipe?: IRecipe;
    trigger?: React.ReactNode;
}

interface FormState {
    name: string;
    recipeIngredients: IRecipe["recipeIngredients"];
}

export function NewRecipeDialog({ recipe, trigger }: RecipeDialogProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<FormState>({ name: "", recipeIngredients: [] });
    const [page, setPage] = useState<number>(0);
    const { saveRecipe, updateRecipe } = useRecipes()!;
    const isEditMode = !!recipe;

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (open) {
            if (isEditMode && recipe) {
                // Load recipe data for editing
                setFormData({
                    name: recipe.name,
                    recipeIngredients: [...recipe.recipeIngredients]
                });
            } else {
                // Reset for new recipe
                setFormData({ name: "", recipeIngredients: [] });
            }
            setPage(0);
        }
    }, [open, recipe, isEditMode]);

    function updateRecipeName(value: string): void {
        setFormData({ ...formData, name: value });
    }

    const updateIngredientName = (index: number, value: string) => {
        setFormData((current) => ({
            ...current,
            recipeIngredients: current.recipeIngredients.map((ingredient, i) =>
                i === index ? { ...ingredient, name: value } : ingredient
            )
        }));
    };

    const updateIngredientQuantity = (index: number, value: number) => {
        setFormData((current) => ({
            ...current,
            recipeIngredients: current.recipeIngredients.map((ingredient, i) =>
                i === index ? { ...ingredient, quantity: value } : ingredient
            )
        }));
    };

    const removeIngredient = (index: number) => {
        setFormData((current) => ({
            ...current,
            recipeIngredients: current.recipeIngredients.filter((_, i) => i !== index)
        }));
    };

    const addIngredient = () => {
        setFormData((current) => ({
            ...current,
            recipeIngredients: [...current.recipeIngredients, { name: "", quantity: 0, unit: "" }]
        }));
    };

    const isFirstPageValid = !formData.name || formData.recipeIngredients.length === 0 || formData.recipeIngredients.some((ing) => !ing.name);
    const isSecondPageValid = !formData.name || formData.recipeIngredients.length === 0 || formData.recipeIngredients.some((ing) => ing.quantity === 0);

    const onSave = async () => {
        const recipeData = {
            id: isEditMode ? recipe!.id : 0,
            name: formData.name,
            recipeIngredients: formData.recipeIngredients.map((ingredient) => ({
                name: ingredient.name,
                quantity: ingredient.quantity || 0,
                unit: "ml"
            }))
        };

        if (isEditMode) {
            await updateRecipe(recipe!.id, recipeData);
        } else {
            await saveRecipe(recipeData);
        }

        setOpen(false);
    };

    const dialogTitle = isEditMode ? "Edit Recipe" : "New Recipe";
    const dialogDescription = isEditMode
        ? "Update your cocktail recipe."
        : "Create a new cocktail recipe by filling out the form below.";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="ghost">New Recipe</Button>}
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                {/* Title */}
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>
                {/* Recipe Name */}
                <Field>
                    <FieldLabel htmlFor="input-field-name">Name</FieldLabel>
                    <Input
                        id="input-field-name"
                        type="text"
                        placeholder="Enter the recipe name"
                        value={formData.name}
                        onChange={(event) => updateRecipeName(event.target.value)}
                    />
                    <FieldDescription>
                        Choose a unique name for your recipe.
                    </FieldDescription>
                </Field>
                <Separator className="my-0" />
                {/* Ingredients */}
                <DialogTitle>Ingredients</DialogTitle>
                {formData.recipeIngredients.map((ingredient, index) => (
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
                                    onClick={() => removeIngredient(index)}
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
                            <Button variant="secondary" onClick={addIngredient}>
                                Add
                            </Button>
                            <Button disabled={isFirstPageValid} onClick={() => { setPage(1); }}>
                                Next
                            </Button>
                        </Field>) : (
                        <Field orientation="horizontal" className="gap-2 w-full justify-end">
                            {/* Navigation Second Page */}
                            <Button variant="secondary" onClick={() => { setPage(0); }}>
                                Return
                            </Button>
                            <DialogClose asChild>
                                <Button
                                    disabled={isSecondPageValid}
                                    onClick={onSave}
                                >
                                    {isEditMode ? "Update" : "Save"}
                                </Button>
                            </DialogClose>
                        </Field>)}
                </Field>
            </DialogContent>
        </Dialog>
    )
}