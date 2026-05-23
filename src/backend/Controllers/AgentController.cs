using System.Text.Json;
using CocktailMaker.Data.Contexts;
using CocktailMaker.Models.DTOs;
using CocktailMaker.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CocktailMaker.Controllers;

[ApiController]
[Route("api/agents")]
public class AgentController : ControllerBase
{
    private readonly CocktailDbContext _context;
    private readonly AgentEventBroadcaster _broadcaster;
    private readonly IMqttService _mqttService;
    private readonly JsonSerializerOptions _jsonOptions;

    public AgentController(
        CocktailDbContext context,
        AgentEventBroadcaster broadcaster,
        IMqttService mqttService,
        IOptions<JsonOptions> jsonOptions
    )
    {
        _context = context;
        _broadcaster = broadcaster;
        _mqttService = mqttService;
        _jsonOptions = jsonOptions.Value.JsonSerializerOptions;
    }

    // GET: api/agents
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AgentDto>>> GetAgents()
    {
        var agents = await _context.Agents.ToListAsync();
        return Ok(agents.Select(AgentDto.From));
    }

    // PATCH: api/agents/{id}
    [HttpPatch("{id}")]
    public async Task<IActionResult> RenameAgent(int id, [FromBody] RenameAgentRequest request)
    {
        var agent = await _context.Agents.FindAsync(id);
        if (agent == null)
            return NotFound();

        agent.Name = request.Name;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // POST: api/agents/{id}/dispense
    [HttpPost("{id}/dispense")]
    public async Task<IActionResult> Dispense(int id, [FromBody] DispenseRequest request)
    {
        var agent = await _context.Agents.FindAsync(id);
        if (agent == null)
            return NotFound();

        var topic = $"cocktailmaker/agents/{agent.AgentId}/command";
        var payload = JsonSerializer.Serialize(new { recipeId = request.RecipeId }, _jsonOptions);
        await _mqttService.PublishAsync(topic, payload);
        return Accepted();
    }

    // GET: api/agents/{id}/pumps
    [HttpGet("{id}/pumps")]
    public async Task<ActionResult<IEnumerable<AgentPumpDto>>> GetAgentPumps(int id)
    {
        var agent = await _context.Agents.FindAsync(id);
        if (agent == null)
            return NotFound();

        var pumps = agent.PumpsJson?.Select(p => new AgentPumpDto(p.PumpIndex, p.IngredientId, p.IngredientName))
            ?? Enumerable.Empty<AgentPumpDto>();
        return Ok(pumps);
    }

    // PUT: api/agents/{id}/pumps
    [HttpPut("{id}/pumps")]
    public async Task<IActionResult> UpdateAgentPumps(int id, [FromBody] List<UpdatePumpSlotRequest> request)
    {
        var agent = await _context.Agents.FindAsync(id);
        if (agent == null)
            return NotFound();

        var ingredientIds = request.Select(r => r.IngredientId).Where(i => i.HasValue).Select(i => i!.Value).ToList();
        var ingredients = await _context.Ingredients
            .Where(i => ingredientIds.Contains(i.Id))
            .ToDictionaryAsync(i => i.Id, i => i.Name);

        agent.PumpsJson = request.Select(r => new Data.Entities.PumpSlot
        {
            PumpIndex = r.PumpIndex,
            IngredientId = r.IngredientId,
            IngredientName = r.IngredientId.HasValue && ingredients.TryGetValue(r.IngredientId.Value, out var name) ? name : null,
        }).ToList();

        await _context.SaveChangesAsync();

        var payload = JsonSerializer.Serialize(agent.PumpsJson, _jsonOptions);
        await _mqttService.PublishAsync($"cocktailmaker/agents/{agent.AgentId}/config", payload, retain: true);

        return NoContent();
    }

    // GET: api/agents/events
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
                var data = JsonSerializer.Serialize(evt, _jsonOptions);
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
