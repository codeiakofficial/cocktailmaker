using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace CocktailMaker.Controllers;

[ApiController]
[Route("api/images")]
public class ImageController : ControllerBase
{
    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/gif", "image/webp"
    };

    private readonly string _uploadsPath;

    public ImageController(IWebHostEnvironment env)
    {
        _uploadsPath = Path.Combine(env.WebRootPath, "uploads");
    }

    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        if (!AllowedMimeTypes.Contains(file.ContentType))
            return BadRequest("Only JPEG, PNG, GIF, and WebP images are accepted.");

        Directory.CreateDirectory(_uploadsPath);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(_uploadsPath, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream);

        var url = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
        return Ok(new { url });
    }
}
