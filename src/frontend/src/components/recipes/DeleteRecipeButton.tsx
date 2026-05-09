import { Button } from "../ui/button";


export function DeleteRecipeButton(props: { recipeId: number, className?: string }) {
    return (
        <Button variant="outline" className={`w-full ${props.className || ''}`}>
            ✕
        </Button>
    );
}