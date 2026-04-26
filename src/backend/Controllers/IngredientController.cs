using Microsoft.AspNetCore.Mvc;
using System.Text.Encodings.Web;

namespace CocktailMaker.Controllers;

public class IngredientController : Controller
{
    // 
    // GET: /Ingredient/
    public string Index()
    {
        return "This is my default action...";
    }
    // 
    // GET: /Ingredient/Welcome/ 
    public string Welcome()
    {
        return "This is the Welcome action method...";
    }
}