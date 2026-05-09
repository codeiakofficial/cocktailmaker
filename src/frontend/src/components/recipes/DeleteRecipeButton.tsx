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
        <Button variant="outline" className={`w-full ${props.className || ''}`} onClick={handleDelete}>
            ✕
        </Button>
    );
}