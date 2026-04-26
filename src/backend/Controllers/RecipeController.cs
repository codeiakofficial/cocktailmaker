using Microsoft.AspNetCore.Mvc;
using System.Text.Encodings.Web;

namespace CocktailMaker.Controllers;

public class RecipeController : Controller
{
    // 
    // GET: /Recipe/
    public string Index()
    {
        return "This is my default action...";
    }
    // 
    // GET: /Recipe/Welcome/ 
    public string Welcome()
    {
        return "This is the Welcome action method...";
    }
}