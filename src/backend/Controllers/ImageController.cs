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
    private readonly string _defaultsPath;

    public ImageController(IWebHostEnvironment env)
    {
        _uploadsPath = Path.Combine(env.WebRootPath, "uploads");
        _defaultsPath = Path.Combine(env.WebRootPath, "defaults");
    }

    [HttpGet]
    public IActionResult List()
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var defaults = Directory.Exists(_defaultsPath)
            ? Directory.GetFiles(_defaultsPath)
                .Select(f => new ImageDto(
                    $"{baseUrl}/defaults/{Path.GetFileName(f)}",
                    Path.GetFileName(f),
                    true))
            : [];

        var uploads = Directory.Exists(_uploadsPath)
            ? Directory.GetFiles(_uploadsPath)
                .Select(f => new ImageDto(
                    $"{baseUrl}/uploads/{Path.GetFileName(f)}",
                    Path.GetFileName(f),
                    false))
            : [];

        return Ok(defaults.Concat(uploads));
    }

    [HttpDelete("{filename}")]
    public IActionResult Delete(string filename)
    {
        if (Directory.Exists(_defaultsPath) &&
            System.IO.File.Exists(Path.Combine(_defaultsPath, filename)))
            return Forbid();

        var filePath = Path.Combine(_uploadsPath, filename);
        if (!System.IO.File.Exists(filePath))
            return NotFound();

        System.IO.File.Delete(filePath);
        return Ok();
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

    private sealed record ImageDto(string Url, string Filename, bool IsDefault);
}
