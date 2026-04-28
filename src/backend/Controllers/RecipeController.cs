using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CocktailMaker.Data.Contexts;
using CocktailMaker.Models.DTOs;
using System.Text.Json;

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
        var recipes = await _context.Recipes
            .ToListAsync();

        var recipeDtos = recipes.Select(r => new RecipeDto(r.Id, r.Name, JsonSerializer.Deserialize<List<string>>(r.Ingredients) ?? new List<string>())).ToList();

        return Ok(recipeDtos);
    }

    // GET: api/recipe/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RecipeDto>> GetRecipe(int id)
    {
        var recipe = await _context.Recipes
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null)
        {
            return NotFound();
        }
        var recipeDto = new RecipeDto(recipe.Id, recipe.Name, JsonSerializer.Deserialize<List<string>>(recipe.Ingredients) ?? new List<string>());
        return Ok(recipeDto);
    }

    // POST: api/recipe
    [HttpPost]
    public async Task<ActionResult<RecipeDto>> CreateRecipe([FromBody] CreateRecipeDto createDto)
    {
        var recipe = new Data.Entities.Recipe
        {
            Name = createDto.Name,
            Ingredients = JsonSerializer.Serialize(createDto.Ingredients)
        };

        _context.Recipes.Add(recipe);
        await _context.SaveChangesAsync();

        var recipeDto = new RecipeDto(recipe.Id, recipe.Name, JsonSerializer.Deserialize<List<string>>(recipe.Ingredients) ?? new List<string>());
        return CreatedAtAction(nameof(GetRecipe), new { id = recipe.Id }, recipeDto);
    }

    // PUT: api/recipe/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRecipe(int id, [FromBody] UpdateRecipeDto updateDto)
    {
        var recipe = await _context.Recipes
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null)
        {
            return NotFound();
        }

        recipe.Name = updateDto.Name;
        recipe.Ingredients = JsonSerializer.Serialize(updateDto.Ingredients);

        await _context.SaveChangesAsync();

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