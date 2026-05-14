using CocktailMaker.Data.Contexts;
using CocktailMaker.Data.Entities;
using CocktailMaker.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CocktailMaker.Controllers;

[ApiController]
[Route("api/ingredients")]
public class IngredientController : Controller
{
    private readonly CocktailDbContext _context;

    public IngredientController(CocktailDbContext context)
    {
        _context = context;
    }

    // GET: api/ingredient
    [HttpGet]
    public async Task<ActionResult<IEnumerable<IngredientDto>>> GetIngredients()
    {
        var ingredients = await _context.Ingredients.ToListAsync();

        var ingredientDtos = ingredients.Select(IngredientDto.From).ToList();

        return Ok(ingredientDtos);
    }

    // POST: api/ingredient
    [HttpPost]
    public async Task<ActionResult<CreateIngredientDto>> CreateIngredient(
        [FromBody] CreateIngredientDto createDto
    )
    {
        var ingredient = new Ingredient { Name = createDto.Name };

        _context.Ingredients.Add(ingredient);
        await _context.SaveChangesAsync();

        var resultDto = CreateIngredientDto.From(ingredient);

        return CreatedAtAction(nameof(CreateIngredient), new { name = ingredient.Name }, resultDto);
    }

    // PUT: api/ingredient/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIngredient(
        int id,
        [FromBody] UpdateIngredientDto updateDto
    )
    {
        var ingredient = await _context.Ingredients.FirstOrDefaultAsync(i => i.Id == id);

        if (ingredient == null)
        {
            return NotFound();
        }

        ingredient.Name = updateDto.Name;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/ingredient/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIngredient(int id)
    {
        var ingredient = await _context.Ingredients.FirstOrDefaultAsync(i => i.Id == id);

        if (ingredient == null)
        {
            return NotFound();
        }

        _context.Ingredients.Remove(ingredient);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
