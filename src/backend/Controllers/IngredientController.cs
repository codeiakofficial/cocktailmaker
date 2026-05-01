using CocktailMaker.Data.Contexts;
using CocktailMaker.Data.Entities;
using CocktailMaker.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CocktailMaker.Controllers;

[ApiController]
[Route("api/[controller]")]
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
        var ingredient = new Data.Entities.Ingredient { Name = createDto.Name };

        _context.Ingredients.Add(ingredient);
        await _context.SaveChangesAsync();

        var resultDto = CreateIngredientDto.From(ingredient);

        return CreatedAtAction(nameof(CreateIngredient), new { name = ingredient.Name }, resultDto);
    }
}
