import { Card, CardContent } from "../ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel"
import { DeleteRecipeButton } from './DeleteRecipeButton';
import { EditRecipeButton } from './EditRecipeButton';
import { useRecipes } from '../../contexts/RecipeContext';
import { useAgents } from '../../contexts/AgentContext';
import { Button } from '../ui/button';

export function RecipeCarousel() {
  const { recipes } = useRecipes();
  const { agents, dispense } = useAgents();
  const hasOnlineAgent = agents.some(a => a.isOnline);

  return (
    <Carousel className="w-full" opts={{
      align: "start",
      loop: true,
      dragFree: true
    }}>
      <CarouselContent>
        {recipes.map((recipe, index) => (
          <CarouselItem key={recipe.id} className="basis-1/3 pl-10">
            <Card className="relative">
              <div className="absolute top-4 right-4 flex gap-2">
                <EditRecipeButton recipe={recipes[index]} className="w-10 h-10" />
                <DeleteRecipeButton recipeId={recipe.id} className="w-10 h-10" />
              </div>
              <CardContent className="flex aspect-square items-center justify-center p-6 flex-col">
                {recipe.imageUrl && (
                  <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-32 object-cover rounded-md mb-4" />
                )}
                <span className="text-4xl font-semibold">{recipe.name}</span>
                <ul className="mt-4">
                  {recipe.recipeIngredients.map((ingredient, i) => (
                    <li key={i} className="text-sm text-gray-500">
                      {ingredient.name}: {ingredient.quantity} {ingredient.unit}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6"
                  disabled={!hasOnlineAgent}
                  onClick={() => dispense(recipe.id)}
                  title={hasOnlineAgent ? undefined : 'No agent online'}
                >
                  Dispense
                </Button>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
