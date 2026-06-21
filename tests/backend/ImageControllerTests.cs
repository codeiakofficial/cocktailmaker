using CocktailMaker.Controllers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;

namespace CocktailMaker.Tests;

public class ImageControllerTests : IDisposable
{
    private readonly string _uploadsDir;
    private readonly ImageController _controller;

    public ImageControllerTests()
    {
        _uploadsDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(_uploadsDir);

        var env = new TestWebHostEnvironment { WebRootPath = _uploadsDir };
        _controller = new ImageController(env);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
        _controller.ControllerContext.HttpContext.Request.Scheme = "http";
        _controller.ControllerContext.HttpContext.Request.Host = new HostString("localhost", 8080);
    }

    [Fact]
    public async Task Upload_ValidJpeg_ReturnsOkWithUrl()
    {
        var file = MakeFormFile("test.jpg", "image/jpeg");

        var result = await _controller.Upload(file);

        var ok = Assert.IsType<OkObjectResult>(result);
        var url = GetUrl(ok.Value);
        Assert.StartsWith("http://localhost:8080/uploads/", url);
        Assert.EndsWith(".jpg", url);
    }

    [Fact]
    public async Task Upload_ValidPng_ReturnsOkWithUrl()
    {
        var file = MakeFormFile("photo.png", "image/png");

        var result = await _controller.Upload(file);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.StartsWith("http://localhost:8080/uploads/", GetUrl(ok.Value));
    }

    [Fact]
    public async Task Upload_SavesFileToDisk()
    {
        var file = MakeFormFile("save.jpg", "image/jpeg");

        var result = await _controller.Upload(file);

        var ok = Assert.IsType<OkObjectResult>(result);
        var url = GetUrl(ok.Value);
        var fileName = url.Split('/').Last();
        Assert.True(File.Exists(Path.Combine(_uploadsDir, "uploads", fileName)));
    }

    [Fact]
    public async Task Upload_EmptyFile_ReturnsBadRequest()
    {
        var content = new MemoryStream(Array.Empty<byte>());
        var file = new FormFile(content, 0, 0, "file", "empty.jpg");
        file.Headers = new HeaderDictionary();
        file.ContentType = "image/jpeg";

        var result = await _controller.Upload(file);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Upload_NonImageMimeType_ReturnsBadRequest()
    {
        var file = MakeFormFile("evil.exe", "application/octet-stream");

        var result = await _controller.Upload(file);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void List_ReturnsUploadsAndDefaults()
    {
        Directory.CreateDirectory(Path.Combine(_uploadsDir, "uploads"));
        Directory.CreateDirectory(Path.Combine(_uploadsDir, "defaults"));
        File.WriteAllBytes(Path.Combine(_uploadsDir, "uploads", "photo.jpg"), new byte[] { 1 });
        File.WriteAllBytes(Path.Combine(_uploadsDir, "defaults", "bg.jpg"), new byte[] { 2 });

        var result = _controller.List();

        var ok = Assert.IsType<OkObjectResult>(result);
        var items = Assert.IsAssignableFrom<IEnumerable<object>>(ok.Value);
        Assert.Equal(2, items.Count());
    }

    [Fact]
    public void List_WhenNoUploads_ReturnsDefaultsOnly()
    {
        Directory.CreateDirectory(Path.Combine(_uploadsDir, "defaults"));
        File.WriteAllBytes(Path.Combine(_uploadsDir, "defaults", "bg.jpg"), new byte[] { 2 });

        var result = _controller.List();

        var ok = Assert.IsType<OkObjectResult>(result);
        var items = Assert.IsAssignableFrom<IEnumerable<object>>(ok.Value);
        Assert.Single(items);
    }

    [Fact]
    public void Delete_UploadedFile_ReturnsOkAndDeletesFile()
    {
        Directory.CreateDirectory(Path.Combine(_uploadsDir, "uploads"));
        var filePath = Path.Combine(_uploadsDir, "uploads", "photo.jpg");
        File.WriteAllBytes(filePath, new byte[] { 1 });

        var result = _controller.Delete("photo.jpg");

        Assert.IsType<OkResult>(result);
        Assert.False(File.Exists(filePath));
    }

    [Fact]
    public void Delete_DefaultFile_ReturnsForbidden()
    {
        Directory.CreateDirectory(Path.Combine(_uploadsDir, "defaults"));
        File.WriteAllBytes(Path.Combine(_uploadsDir, "defaults", "bg.jpg"), new byte[] { 2 });

        var result = _controller.Delete("bg.jpg");

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public void Delete_NonExistentFile_ReturnsNotFound()
    {
        var result = _controller.Delete("missing.jpg");

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public void Delete_TraversalPath_ReturnsBadRequest()
    {
        var result = _controller.Delete("../sensitive.txt");

        Assert.IsType<BadRequestResult>(result);
    }

    public void Dispose()
    {
        if (Directory.Exists(_uploadsDir))
            Directory.Delete(_uploadsDir, recursive: true);
    }

    private static FormFile MakeFormFile(string fileName, string contentType)
    {
        var content = new MemoryStream(new byte[] { 1, 2, 3, 4, 5 });
        var file = new FormFile(content, 0, content.Length, "file", fileName);
        file.Headers = new HeaderDictionary();
        file.ContentType = contentType;
        return file;
    }

    private static string GetUrl(object? value)
    {
        var prop = value?.GetType().GetProperty("url");
        return (string?)prop?.GetValue(value) ?? string.Empty;
    }

    private sealed class TestWebHostEnvironment : IWebHostEnvironment
    {
        public string WebRootPath { get; set; } = Path.GetTempPath();
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string ApplicationName { get; set; } = "Test";
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = Path.GetTempPath();
        public string EnvironmentName { get; set; } = "Testing";
    }
}
