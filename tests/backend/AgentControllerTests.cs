using CocktailMaker.Controllers;
using CocktailMaker.Data.Contexts;
using CocktailMaker.Data.Entities;
using CocktailMaker.Models.DTOs;
using CocktailMaker.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CocktailMaker.Tests;

public class AgentControllerTests
{
    private readonly DbContextOptions<CocktailDbContext> _options;
    private readonly FakeMqttService _mqtt = new();

    public AgentControllerTests()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();
        _options = new DbContextOptionsBuilder<CocktailDbContext>().UseSqlite(connection).Options;
        using var context = new CocktailDbContext(_options);
        context.Database.EnsureCreated();
    }

    private AgentController CreateController(CocktailDbContext context) =>
        new(context, new AgentEventBroadcaster(), _mqtt, Options.Create(new Microsoft.AspNetCore.Mvc.JsonOptions()));

    private sealed class FakeMqttService : IMqttService
    {
        public List<(string Topic, string Payload, bool Retain)> Published = new();
        public Task PublishAsync(string topic, string payload, bool retain = false)
        {
            Published.Add((topic, payload, retain));
            return Task.CompletedTask;
        }
    }

    // --- Rename ---

    [Fact]
    public async Task RenameAgent_UpdatesNameInDb()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Agents.Add(new Agent { Name = "Old Name", AgentId = "dispenser-1" });
            context.SaveChanges();
        }

        using (var context = new CocktailDbContext(_options))
        {
            var result = await CreateController(context).RenameAgent(1, new RenameAgentRequest("New Name"));
            Assert.IsType<NoContentResult>(result);
        }

        using (var context = new CocktailDbContext(_options))
        {
            var agent = context.Agents.Find(1);
            Assert.Equal("New Name", agent!.Name);
        }
    }

    [Fact]
    public async Task RenameAgent_DoesNotChangeAgentId()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Agents.Add(new Agent { Name = "Old Name", AgentId = "dispenser-1" });
            context.SaveChanges();
        }

        using (var context = new CocktailDbContext(_options))
        {
            await CreateController(context).RenameAgent(1, new RenameAgentRequest("New Name"));
        }

        using (var context = new CocktailDbContext(_options))
        {
            var agent = context.Agents.Find(1);
            Assert.Equal("dispenser-1", agent!.AgentId);
        }
    }

    // --- Pumps ---

    [Fact]
    public async Task GetAgentPumps_ReturnsEmpty_WhenNoPumpsConfigured()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Agents.Add(new Agent { Name = "A", AgentId = "dispenser-1" });
            context.SaveChanges();
        }

        using var ctx = new CocktailDbContext(_options);
        var result = await CreateController(ctx).GetAgentPumps(1);
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var pumps = Assert.IsAssignableFrom<IEnumerable<AgentPumpDto>>(ok.Value);
        Assert.Empty(pumps);
    }

    [Fact]
    public async Task GetAgentPumps_ReturnsPumps_WhenConfigured()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Ingredients.Add(new Ingredient { Name = "Vodka" });
            context.Agents.Add(new Agent
            {
                Name = "A", AgentId = "dispenser-1",
                PumpsJson = new List<PumpSlot> { new() { PumpIndex = 0, IngredientId = 1, IngredientName = "Vodka" } }
            });
            context.SaveChanges();
        }

        using var ctx = new CocktailDbContext(_options);
        var result = await CreateController(ctx).GetAgentPumps(1);
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var pumps = Assert.IsAssignableFrom<IEnumerable<AgentPumpDto>>(ok.Value).ToList();
        Assert.Single(pumps);
        Assert.Equal(0, pumps[0].PumpIndex);
        Assert.Equal(1, pumps[0].IngredientId);
        Assert.Equal("Vodka", pumps[0].IngredientName);
    }

    [Fact]
    public async Task GetAgentPumps_UnknownId_Returns404()
    {
        using var ctx = new CocktailDbContext(_options);
        var result = await CreateController(ctx).GetAgentPumps(999);
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task UpdateAgentPumps_SavesPumpsToDb()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Ingredients.Add(new Ingredient { Name = "Gin" });
            context.Agents.Add(new Agent { Name = "A", AgentId = "dispenser-1" });
            context.SaveChanges();
        }

        using (var context = new CocktailDbContext(_options))
        {
            var result = await CreateController(context).UpdateAgentPumps(1,
                new List<UpdatePumpSlotRequest> { new(0, 1) });
            Assert.IsType<NoContentResult>(result);
        }

        using (var context = new CocktailDbContext(_options))
        {
            var agent = context.Agents.Find(1);
            Assert.NotNull(agent!.PumpsJson);
            Assert.Single(agent.PumpsJson!);
            Assert.Equal(0, agent.PumpsJson![0].PumpIndex);
            Assert.Equal(1, agent.PumpsJson![0].IngredientId);
            Assert.Equal("Gin", agent.PumpsJson![0].IngredientName);
        }
    }

    [Fact]
    public async Task UpdateAgentPumps_PublishesRetainedMqttConfig()
    {
        using (var context = new CocktailDbContext(_options))
        {
            context.Ingredients.Add(new Ingredient { Name = "Rum" });
            context.Agents.Add(new Agent { Name = "A", AgentId = "dispenser-1" });
            context.SaveChanges();
        }

        using var ctx = new CocktailDbContext(_options);
        await CreateController(ctx).UpdateAgentPumps(1, new List<UpdatePumpSlotRequest> { new(2, 1) });

        Assert.Single(_mqtt.Published);
        var (topic, payload, retain) = _mqtt.Published[0];
        Assert.Equal("cocktailmaker/agents/dispenser-1/config", topic);
        Assert.True(retain);
        Assert.Contains("\"pumpIndex\"", payload);
        Assert.Contains("\"ingredientName\"", payload);
        Assert.Contains("Rum", payload);
    }

    [Fact]
    public async Task UpdateAgentPumps_UnknownId_Returns404()
    {
        using var ctx = new CocktailDbContext(_options);
        var result = await CreateController(ctx).UpdateAgentPumps(999, new List<UpdatePumpSlotRequest>());
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task RenameAgent_UnknownId_Returns404()
    {
        using var context = new CocktailDbContext(_options);
        var result = await CreateController(context).RenameAgent(999, new RenameAgentRequest("X"));
        Assert.IsType<NotFoundResult>(result);
    }
}
