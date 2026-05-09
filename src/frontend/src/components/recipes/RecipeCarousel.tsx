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

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/Recipe/');
        const data = await response.json() as Recipe[];
        setRecipes(data);
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
              <DeleteRecipeButton recipeId={recipes[index].id} className="w-10 h-10 absolute top-4 right-4" />
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
