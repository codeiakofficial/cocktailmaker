using Microsoft.AspNetCore.Mvc;
using System.Text.Encodings.Web;

namespace CocktailMaker.Controllers;

public class AgentController : Controller
{
    // 
    // GET: /Agent/
    public string Index()
    {
        return "This is my default action...";
    }
    // 
    // GET: /Agent/Welcome/ 
    public string Welcome()
    {
        return "This is the Welcome action method...";
    }
}