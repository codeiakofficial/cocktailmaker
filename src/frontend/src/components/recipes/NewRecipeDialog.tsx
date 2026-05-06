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
import { RecipeIngredientsInput } from "./RecipeIngredientsInput"
import { RecipeNameInput } from "./RecipeNameInput"

export function RecipeDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">New Recipe</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>New Recipe</DialogTitle>
                    <DialogDescription>
                        Create a new cocktail recipe by filling out the form below.
                    </DialogDescription>
                </DialogHeader>
                <RecipeNameInput />
                <Separator className="my-0" />
                <DialogTitle>Ingredients</DialogTitle>
                <RecipeIngredientsInput />
            </DialogContent>
        </Dialog>
    )
}