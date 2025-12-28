using System;
using System.IO;
using System.Threading.Tasks;
using MyApp.Interfaces;

namespace MyApp.Services;

public class FileStorageService : IFileStorageService
{
    private readonly string _basePath;

    public FileStorageService()
    {
        _basePath = Path.Combine(Directory.GetCurrentDirectory(), "storage");
        if (!Directory.Exists(_basePath)) Directory.CreateDirectory(_basePath);
    }

    public async Task<string> StoreAsync(byte[] data, string filename)
    {
        var id = Guid.NewGuid().ToString("N") + Path.GetExtension(filename);
        var full = Path.Combine(_basePath, id);
        await File.WriteAllBytesAsync(full, data);
        return id;
    }

    public async Task<byte[]?> GetAsync(string storageId)
    {
        var full = Path.Combine(_basePath, storageId);
        if (!File.Exists(full)) return null;
        return await File.ReadAllBytesAsync(full);
    }

    public Task DeleteAsync(string storageId)
    {
        var full = Path.Combine(_basePath, storageId);
        if (File.Exists(full)) File.Delete(full);
        return Task.CompletedTask;
    }
}