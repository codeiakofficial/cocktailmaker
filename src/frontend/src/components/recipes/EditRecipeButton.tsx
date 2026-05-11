import { Button } from "../ui/button";
import { NewRecipeDialog } from "./NewRecipeDialog";
import type { IRecipe } from "../../contexts/Recipe";

export function EditRecipeButton(props: { recipe: IRecipe, className?: string }) {
    return (
        <NewRecipeDialog
            recipe={props.recipe}
            trigger={
                <Button variant="outline" className={`w-full ${props.className || ''}`}>
                    ✎
                </Button>
            }
        />
    );
}
