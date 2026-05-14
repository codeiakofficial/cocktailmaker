import { useState, useEffect } from 'react';
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

interface Recipe {
  id: number;
  name: string;
  recipeIngredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
}

export function RecipeCarousel() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { recipes: contextRecipes } = useRecipes()!;
  const { agents, dispense } = useAgents();
  const hasOnlineAgent = agents.some(a => a.isOnline);

  useEffect(() => {
    setRecipes(contextRecipes);
    setIsLoading(false);
  }, [contextRecipes]);

  if (isLoading) {
    return <div>Loading recipes...</div>;
  }

  return (
    <Carousel className="w-full" opts={{
      align: "start",
      loop: true,
      dragFree: true
    }}>
      <CarouselContent>
        {Array.from({ length: recipes.length }).map((_, index) => (
          <CarouselItem key={index} className="basis-1/3 pl-10">
            <Card className='relative'>
              <div className="absolute top-4 right-4 flex gap-2">
                <EditRecipeButton recipe={recipes[index]} className="w-10 h-10" />
                <DeleteRecipeButton recipeId={recipes[index].id} className="w-10 h-10" />
              </div>
              <CardContent className="flex aspect-square items-center justify-center p-6 flex-col">
                {/* Recipe name */ }
                <span className="text-4xl font-semibold">{recipes[index].name}</span>
                {/* Ingredients */}
                <ul className="mt-4">
                  {recipes[index].recipeIngredients.map((ingredient, i) => (
                    <li key={i} className="text-sm text-gray-500">
                      {ingredient.name}: {ingredient.quantity} {ingredient.unit}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6"
                  disabled={!hasOnlineAgent}
                  onClick={() => dispense(recipes[index].id)}
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
