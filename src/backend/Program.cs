using CocktailMaker.Data.Contexts;
using CocktailMaker.Services;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
    );

// Register AgentEventBroadcaster as singleton for SSE broadcasting
builder.Services.AddSingleton<AgentEventBroadcaster>();

// Register MQTT background service (singleton so it can be injected by concrete type)
builder.Services.AddSingleton<MqttService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<MqttService>());

// Configure SQLite database
builder.Services.AddDbContext<CocktailDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Add CORS policy to allow requests from the frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod();
        }
    );
});

// Add support for OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

// Ensure database is created and seed development data
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CocktailDbContext>();
    dbContext.Database.EnsureCreated();

    // Seed development data only in development environment
    if (app.Environment.IsDevelopment())
    {
        dbContext.SeedDeveloperData();
    }
}

// Configure the HTTP request pipeline.
app.MapOpenApi();
app.MapScalarApiReference();
app.UseExceptionHandler("/Home/Error");
// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
app.UseHsts();

app.UseHttpsRedirection();
app.UseRouting();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();
