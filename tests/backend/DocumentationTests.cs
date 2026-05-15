using System.Reflection;
using CocktailMaker.Controllers;
using CocktailMaker.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace CocktailMaker.Tests;

/// <summary>
/// Verifies that documented API contracts (docs/architecture.md) match the actual implementation.
/// A failing test here means either the docs or the code need to be updated — they must agree.
/// </summary>
public class DocumentationTests
{
    private static readonly HashSet<(string Method, string Template)> ActualRoutes = BuildRouteMap();

    private static HashSet<(string Method, string Template)> BuildRouteMap()
    {
        var routes = new HashSet<(string, string)>();
        var assembly = typeof(AgentController).Assembly;

        foreach (var type in assembly.GetTypes().Where(t => t.GetCustomAttribute<ApiControllerAttribute>() != null))
        {
            var controllerTemplate = type.GetCustomAttribute<RouteAttribute>()?.Template ?? "";

            foreach (var method in type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly))
            {
                foreach (var attr in method.GetCustomAttributes().OfType<HttpMethodAttribute>())
                {
                    string fullTemplate;
                    if (attr.Template != null && attr.Template.StartsWith('/'))
                        fullTemplate = attr.Template.TrimStart('/');
                    else if (!string.IsNullOrEmpty(attr.Template))
                        fullTemplate = $"{controllerTemplate}/{attr.Template}";
                    else
                        fullTemplate = controllerTemplate;

                    foreach (var verb in attr.HttpMethods)
                        routes.Add((verb.ToUpperInvariant(), fullTemplate));
                }
            }
        }

        return routes;
    }

    // Endpoints documented in docs/architecture.md — sequence diagrams + SSE stream
    [Theory]
    [InlineData("GET",    "api/recipes")]
    [InlineData("POST",   "api/recipes")]
    [InlineData("GET",    "api/recipes/{id}")]
    [InlineData("PUT",    "api/recipes/{id}")]
    [InlineData("DELETE", "api/recipes/{id}")]
    [InlineData("GET",    "api/ingredients")]
    [InlineData("POST",   "api/ingredients")]
    [InlineData("PUT",    "api/ingredients/{id}")]
    [InlineData("DELETE", "api/ingredients/{id}")]
    [InlineData("GET",    "api/agents")]
    [InlineData("POST",   "api/agents/{id}/dispense")]
    [InlineData("GET",    "api/agents/events")]
    public void DocumentedEndpoint_ExistsInControllers(string method, string template)
    {
        Assert.True(
            ActualRoutes.Contains((method.ToUpperInvariant(), template)),
            $"Documented endpoint '{method} {template}' not found. " +
            $"Either add the endpoint or update docs/architecture.md."
        );
    }

    // Entity fields documented in the ER diagram in docs/architecture.md
    [Fact]
    public void RecipeEntity_HasDocumentedFields()
    {
        var props = typeof(Recipe).GetProperties().Select(p => p.Name).ToHashSet();
        Assert.Contains("Id", props);
        Assert.Contains("Name", props);
        Assert.Contains("RecipeIngredients", props);
    }

    [Fact]
    public void IngredientEntity_HasDocumentedFields()
    {
        var props = typeof(Ingredient).GetProperties().Select(p => p.Name).ToHashSet();
        Assert.Contains("Id", props);
        Assert.Contains("Name", props);
        Assert.Contains("UsedInRecipes", props);
    }

    [Fact]
    public void AgentEntity_HasDocumentedFields()
    {
        var props = typeof(Agent).GetProperties().Select(p => p.Name).ToHashSet();
        Assert.Contains("Id", props);
        Assert.Contains("Name", props);
        Assert.Contains("AgentId", props);
        Assert.Contains("IsOnline", props);
        Assert.Contains("LastSeen", props);
    }

    [Fact]
    public void AgentsMd_LastReviewSection_HasAtLeastOneEntry()
    {
        var root = FindRepoRoot();
        var agentsMd = File.ReadAllText(Path.Combine(root, "AGENTS.md"));

        Assert.Contains("## Last Review", agentsMd);

        var inSection = false;
        var headerSeen = false;
        var separatorSeen = false;
        foreach (var line in agentsMd.Split('\n'))
        {
            if (line.TrimStart('#').Trim() == "Last Review") { inSection = true; continue; }
            if (inSection && line.StartsWith("##")) break;
            if (!inSection || !line.StartsWith("|")) continue;
            if (!headerSeen) { headerSeen = true; continue; }
            if (!separatorSeen) { separatorSeen = true; continue; }
            return; // past header + separator — this is a data row
        }

        Assert.Fail("AGENTS.md '## Last Review' section must contain at least one entry. Update it before merging.");
    }

    private static string FindRepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null && !File.Exists(Path.Combine(dir.FullName, "AGENTS.md")))
            dir = dir.Parent;
        return dir?.FullName ?? throw new DirectoryNotFoundException("Could not locate repo root from test binary path.");
    }
}
