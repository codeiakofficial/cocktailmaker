using System.Text.Json;
using CocktailMaker.Data.Contexts;
using CocktailMaker.Models.DTOs;
using CocktailMaker.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CocktailMaker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgentController : ControllerBase
{
    private readonly CocktailDbContext _context;
    private readonly AgentEventBroadcaster _broadcaster;

    public AgentController(CocktailDbContext context, AgentEventBroadcaster broadcaster)
    {
        _context = context;
        _broadcaster = broadcaster;
    }

    // GET: api/agent
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AgentDto>>> GetAgents()
    {
        var agents = await _context.Agents.ToListAsync();
        return Ok(agents.Select(AgentDto.From));
    }

    // GET: /api/agents/events
    [HttpGet("/api/agents/events")]
    public async Task StreamEvents(CancellationToken ct)
    {
        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";

        var channel = _broadcaster.Subscribe();
        try
        {
            await foreach (var evt in channel.Reader.ReadAllAsync(ct))
            {
                var data = JsonSerializer.Serialize(evt);
                await Response.WriteAsync($"event: agent-status\ndata: {data}\n\n", ct);
                await Response.Body.FlushAsync(ct);
            }
        }
        finally
        {
            _broadcaster.Unsubscribe(channel);
        }
    }
}
