using System.Reflection;
using CocktailMaker.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace CocktailMaker.Tests;

/// <summary>
/// Fitness functions that encode architectural constraints from docs/requirements.md.
/// A failing test here means a documented convention has been violated in code.
/// </summary>
public class ArchitectureTests
{
    private static readonly List<Type> ApiControllers =
        typeof(AgentController).Assembly
            .GetTypes()
            .Where(t => t.GetCustomAttribute<ApiControllerAttribute>() != null)
            .ToList();

    [Fact]
    public void ApiControllers_ExtendControllerBase_NotController()
    {
        Assert.NotEmpty(ApiControllers);

        foreach (var type in ApiControllers)
        {
            Assert.True(
                type.IsSubclassOf(typeof(ControllerBase)),
                $"{type.Name} must extend ControllerBase"
            );
            Assert.False(
                type.IsSubclassOf(typeof(Controller)),
                $"{type.Name} must not extend Controller — API controllers do not render views"
            );
        }
    }

    [Fact]
    public void ApiControllers_HaveExplicitPluralRoutes()
    {
        Assert.NotEmpty(ApiControllers);

        foreach (var type in ApiControllers)
        {
            var route = type.GetCustomAttribute<RouteAttribute>();
            Assert.True(
                route != null,
                $"{type.Name} must declare an explicit [Route] attribute — no [Route(\"api/[controller]\")]"
            );

            var template = route!.Template;
            Assert.True(
                template.StartsWith("api/", StringComparison.OrdinalIgnoreCase),
                $"{type.Name} route '{template}' must start with 'api/'"
            );

            var segment = template.Split('/').ElementAtOrDefault(1) ?? string.Empty;
            Assert.False(
                segment.Contains("[controller]"),
                $"{type.Name} must use an explicit route segment, not the '[controller]' token"
            );
            Assert.Equal(
                segment.ToLowerInvariant(),
                segment
            );
            Assert.True(
                segment.EndsWith("s"),
                $"{type.Name} route segment '{segment}' must be a plural noun (e.g. 'agents', 'recipes')"
            );
        }
    }
}
