using System.Text.Encodings.Web;
using CocktailMaker.Models.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CocktailMaker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgentController : Controller
{
    private List<AgentDto> _agents = new List<AgentDto>
    {
        new(1, "Agent Smith", "123 Matrix Street"),
        new(2, "Agent Johnson", "456 Matrix Avenue"),
        new(3, "Agent Brown", "789 Matrix Boulevard"),
    };

    // GET: api/agent
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AgentDto>>> GetAgents()
    {
        return Ok(_agents);
    }
}
