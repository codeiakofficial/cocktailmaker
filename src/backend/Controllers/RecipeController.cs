using CocktailMaker.Data.Contexts;
using CocktailMaker.Data.Entities;
using CocktailMaker.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CocktailMaker.Controllers;

[ApiController]
[Route("api/recipes")]
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
                r.ImageUrl,
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
            recipe.ImageUrl,
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
            ImageUrl = createDto.ImageUrl,
            RecipeIngredients = createDto.RecipeIngredients ?? new List<RecipeIngredient>(),
        };

        _context.Recipes.Add(recipe);
        await _context.SaveChangesAsync();

        if (createDto.RecipeIngredients != null)
        {
            await AddOrUpdateIngredients(recipe.Id, createDto.RecipeIngredients);
        }

        var recipeDto = new RecipeDto(
            recipe.Id,
            recipe.Name,
            recipe.ImageUrl,
            recipe.RecipeIngredients ?? new List<RecipeIngredient>()
        );

        return CreatedAtAction(nameof(GetRecipe), new { id = recipe.Id }, recipeDto);
    }

    private async Task RemoveRecipeIdFromIngredients(
        int recipeId,
        List<RecipeIngredient>? excludedRecipeIngredients = null
    )
    {
        var ingredients = _context
            .Ingredients.Where(i => i.UsedInRecipes.Contains(recipeId))
            .ToList();

        var filteredIngredients =
            excludedRecipeIngredients == null
                ? ingredients
                : ingredients.Where(i => !excludedRecipeIngredients.Any(ri => ri.Name == i.Name));

        foreach (var ingredient in filteredIngredients)
        {
            ingredient.UsedInRecipes.Remove(recipeId);
            _context.Ingredients.Update(ingredient);
        }

        await _context.SaveChangesAsync();
    }

    private async Task<Ingredient?> GetIngredient(RecipeIngredient recipeIngredient)
    {
        return await _context.Ingredients.FirstOrDefaultAsync(i => i.Name == recipeIngredient.Name);
    }

    private async Task AddRecipeIdToIngredient(int recipeId, Ingredient ingredient)
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

    private async Task AddOrUpdateIngredients(
        int recipeId,
        List<RecipeIngredient> recipeIngredients
    )
    {
        foreach (var recipeIngredient in recipeIngredients)
        {
            var ingredient = await GetIngredient(recipeIngredient);
            if (ingredient != null)
            {
                await AddRecipeIdToIngredient(recipeId, ingredient);
            }
            else
            {
                await CreateIngredientAndAddRecipeId(recipeId, recipeIngredient);
            }
        }
    }

    private async Task CreateIngredientAndAddRecipeId(
        int recipeId,
        RecipeIngredient recipeIngredient
    )
    {
        var newIngredient = new Ingredient { Name = recipeIngredient.Name };
        newIngredient.UsedInRecipes.Add(recipeId);
        _context.Ingredients.Add(newIngredient);
        await _context.SaveChangesAsync();
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

        recipe.Name = updateDto.Name;
        recipe.ImageUrl = updateDto.ImageUrl;
        recipe.RecipeIngredients = updateDto.RecipeIngredients ?? new List<RecipeIngredient>();

        await _context.SaveChangesAsync();

        if (updateDto.RecipeIngredients != null)
        {
            await AddOrUpdateIngredients(recipe.Id, updateDto.RecipeIngredients);
            await RemoveRecipeIdFromIngredients(recipe.Id, updateDto.RecipeIngredients);
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

        await RemoveRecipeIdFromIngredients(recipe.Id);

        return NoContent();
    }
}
