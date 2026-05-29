import { Button } from "../ui/button";
import { useRecipes } from "../../contexts/RecipeContext";

export function DeleteRecipeButton(props: { recipeId: number, className?: string }) {
    const { deleteRecipe } = useRecipes();
    const handleDelete = async () => {
        try {
            await deleteRecipe(props.recipeId);
        } catch (error) {
            console.error('Error deleting recipe:', error);
        }
    };

    return (
        <Button variant="ghost" className={`w-full text-white/70 hover:text-white hover:bg-white/10 ${props.className || ''}`} onClick={handleDelete}>
            ✕
        </Button>
    );
}