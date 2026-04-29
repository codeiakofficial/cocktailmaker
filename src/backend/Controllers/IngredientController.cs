using System.Text.Encodings.Web;
using CocktailMaker.Data.Contexts;
using Microsoft.AspNetCore.Mvc;

namespace CocktailMaker.Controllers;

public class IngredientController : Controller
{
    private readonly CocktailDbContext _context;

    public IngredientController(CocktailDbContext context)
    {
        _context = context;
    }

    // GET: api/ingredient
    // [HttpGet]
    // public async Task<ActionResult<IEnumerable<IngredientDto>>> GetIngredients()
    // {
    //     var ingredients = await _context.Ingredients.ToListAsync();
    //     return ingredients.Select(IngredientDto.From).ToList();
    // }
}
