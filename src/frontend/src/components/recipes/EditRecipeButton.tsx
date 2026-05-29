import { Button } from "../ui/button";
import { NewRecipeDialog } from "./NewRecipeDialog";
import type { IRecipe } from "../../contexts/Recipe";

export function EditRecipeButton(props: { recipe: IRecipe, className?: string }) {
    return (
        <NewRecipeDialog
            recipe={props.recipe}
            trigger={
                <Button variant="ghost" className={`w-full text-white/70 hover:text-white hover:bg-white/10 ${props.className || ''}`}>
                    ✎
                </Button>
            }
        />
    );
}
