import { Button } from "../ui/button";


export function DeleteRecipeButton(props: { recipeId: number, className?: string }) {
    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/Recipe/${props.recipeId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete recipe');
            }
            // Handle successful deletion (e.g., update UI, show success message)
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