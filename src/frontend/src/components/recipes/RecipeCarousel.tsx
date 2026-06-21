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
    <Carousel className="w-full" opts={{ align: 'start', loop: true, dragFree: true }}>
      <CarouselContent className="-ml-4">
        {recipes.map((recipe, index) => (
          <CarouselItem key={recipe.id} className="pl-4 basis-[88%] sm:basis-1/2 lg:basis-1/3">
            <div className="relative rounded-xl overflow-hidden aspect-[3/4] max-md:aspect-auto max-md:h-[calc(100dvh-10rem)]">

              {/* Blurred background image */}
              {recipe.imageUrl
                ? <div
                    className="absolute inset-0 scale-110 bg-cover bg-center"
                    style={{ backgroundImage: `url(${recipe.imageUrl})`, filter: 'blur(6px)' }}
                  />
                : <div className="absolute inset-0 bg-muted" />
              }

              {/* Dark scrim for readability */}
              <div className="absolute inset-0 bg-black/45" />

              {/* Edit / Delete */}
              <div className="absolute top-3 right-3 flex gap-2 z-20">
                <EditRecipeButton recipe={recipes[index]} className="w-9 h-9" />
                <DeleteRecipeButton recipeId={recipe.id} className="w-9 h-9" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-end p-6 text-white z-10">
                <span className="text-2xl font-semibold text-center leading-tight mb-3">{recipe.name}</span>
                <ul className="mb-5 text-center space-y-0.5">
                  {recipe.recipeIngredients.map((ingredient, i) => (
                    <li key={i} className="text-sm text-white/70">
                      {ingredient.name}: {ingredient.quantity} {ingredient.unit}
                    </li>
                  ))}
                </ul>
                <Button
                  disabled={!hasOnlineAgent}
                  onClick={() => dispense(recipe.id)}
                  title={hasOnlineAgent ? undefined : 'No agent online'}
                  className="w-full"
                >
                  Dispense
                </Button>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Arrows — desktop only; mobile uses touch drag */}
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext     className="hidden md:flex" />
    </Carousel>
  )
}
