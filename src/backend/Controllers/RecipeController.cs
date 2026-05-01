using CocktailMaker.Data.Contexts;
using CocktailMaker.Data.Entities;
using CocktailMaker.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CocktailMaker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecipeController : ControllerBase
{
    private readonly CocktailDbContext _context;

    public RecipeController(CocktailDbContext context)
    {
        _context = context;
    }

    // GET: api/recipe
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecipeDto>>> GetRecipes()
    {
        var recipes = await _context.Recipes.ToListAsync();

        var recipeDtos = recipes
            .Select(r => new RecipeDto(
                r.Id,
                r.Name,
                r.RecipeIngredients ?? new List<RecipeIngredient>()
            ))
            .ToList();

        return Ok(recipeDtos);
    }

    // GET: api/recipe/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RecipeDto>> GetRecipe(int id)
    {
        var recipe = await _context.Recipes.FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null)
        {
            return NotFound();
        }
        var recipeDto = new RecipeDto(
            recipe.Id,
            recipe.Name,
            recipe.RecipeIngredients ?? new List<RecipeIngredient>()
        );
        return Ok(recipeDto);
    }

    // POST: api/recipe
    [HttpPost]
    public async Task<ActionResult<RecipeDto>> CreateRecipe([FromBody] CreateRecipeDto createDto)
    {
        var recipe = new Recipe
        {
            Name = createDto.Name,
            RecipeIngredients = createDto.RecipeIngredients ?? new List<RecipeIngredient>(),
        };

        _context.Recipes.Add(recipe);
        await _context.SaveChangesAsync();

        if (createDto.RecipeIngredients != null)
        {
            await UpdateIngredients(recipe.Id, createDto.RecipeIngredients);
        }

        var recipeDto = new RecipeDto(
            recipe.Id,
            recipe.Name,
            recipe.RecipeIngredients ?? new List<RecipeIngredient>()
        );

        return CreatedAtAction(nameof(GetRecipe), new { id = recipe.Id }, recipeDto);
    }

    private async Task UpdateIngredients(
        int recipeId,
        List<RecipeIngredient> recipeIngredients,
        List<RecipeIngredient> oldRecipeIngredients = null
    )
    {
        if (recipeIngredients != null)
        {
            foreach (var recipeIngredient in recipeIngredients)
            {
                // Check if the ingredient already exists in the database
                var ingredient = await GetIngredient(recipeIngredient);
                // If the ingredient exists, check if UsedInRecipes contains the current recipe ID
                if (ingredient != null)
                {
                    await UpdateIngredient(recipeId, ingredient);
                }
                // If the ingredient does not exist, create a new one and add the current recipe ID to UsedInRecipes
                if (ingredient == null)
                {
                    ingredient = await AddIngredient(recipeId, recipeIngredient);
                }
            }

            if (oldRecipeIngredients != null)
            {
                foreach (var oldRecipeIngredient in oldRecipeIngredients)
                {
                    if (!recipeIngredients.Any(ri => ri.Name == oldRecipeIngredient.Name))
                    {
                        var ingredient = await GetIngredient(oldRecipeIngredient);
                        if (ingredient != null)
                        {
                            ingredient.UsedInRecipes.Remove(recipeId);
                            _context.Ingredients.Update(ingredient);
                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }
        }
    }

    private async Task<Ingredient?> GetIngredient(RecipeIngredient recipeIngredient)
    {
        return await _context.Ingredients.FirstOrDefaultAsync(i => i.Name == recipeIngredient.Name);
    }

    private async Task UpdateIngredient(int recipeId, Ingredient? ingredient)
    {
        var existingRecipeIngredient = await _context.Ingredients.FirstOrDefaultAsync(i =>
            i.Id == ingredient.Id && i.UsedInRecipes.Contains(recipeId)
        );
        // If the recipe ID is not already in UsedInRecipes, add it
        if (existingRecipeIngredient == null)
        {
            ingredient.UsedInRecipes.Add(recipeId);
            _context.Ingredients.Update(ingredient);
            await _context.SaveChangesAsync();
        }
    }

    private async Task<Ingredient> AddIngredient(int recipeId, RecipeIngredient recipeIngredient)
    {
        Ingredient ingredient = new Ingredient { Name = recipeIngredient.Name };
        ingredient.UsedInRecipes.Add(recipeId);
        _context.Ingredients.Add(ingredient);
        await _context.SaveChangesAsync();
        return ingredient;
    }

    // PUT: api/recipe/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRecipe(int id, [FromBody] UpdateRecipeDto updateDto)
    {
        var recipe = await _context.Recipes.FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null)
        {
            return NotFound();
        }

        var oldRecipeIngredients = recipe.RecipeIngredients;
        recipe.Name = updateDto.Name;
        recipe.RecipeIngredients = updateDto.RecipeIngredients ?? new List<RecipeIngredient>();

        await _context.SaveChangesAsync();

        if (updateDto.RecipeIngredients != null)
        {
            await UpdateIngredients(recipe.Id, updateDto.RecipeIngredients, oldRecipeIngredients);
        }

        return NoContent();
    }

    // DELETE: api/recipe/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecipe(int id)
    {
        var recipe = await _context.Recipes.FindAsync(id);

        if (recipe == null)
        {
            return NotFound();
        }

        _context.Recipes.Remove(recipe);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
