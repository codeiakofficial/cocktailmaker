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

    public AgentControllerTests()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();
        _options = new DbContextOptionsBuilder<CocktailDbContext>().UseSqlite(connection).Options;
        using var context = new CocktailDbContext(_options);
        context.Database.EnsureCreated();
    }

    private AgentController CreateController(CocktailDbContext context) =>
        new(context, new AgentEventBroadcaster(), null!, Options.Create(new Microsoft.AspNetCore.Mvc.JsonOptions()));

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

    [Fact]
    public async Task RenameAgent_UnknownId_Returns404()
    {
        using var context = new CocktailDbContext(_options);
        var result = await CreateController(context).RenameAgent(999, new RenameAgentRequest("X"));
        Assert.IsType<NotFoundResult>(result);
    }
}
