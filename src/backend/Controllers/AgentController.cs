using CocktailMaker.Data.Contexts;
using CocktailMaker.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CocktailMaker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgentController : ControllerBase
{
    private readonly CocktailDbContext _context;

    public AgentController(CocktailDbContext context)
    {
        _context = context;
    }

    // GET: api/agent
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AgentDto>>> GetAgents()
    {
        var agents = await _context.Agents.ToListAsync();
        return Ok(agents.Select(AgentDto.From));
    }
}
