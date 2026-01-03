using System;
using System.IO;
using System.Threading.Tasks;
using MyApp.Interfaces;

namespace MyApp.Services;

/// <summary>
/// Stores and retrieves files on local disk under an application-specific storage folder.
/// </summary>
public class FileStorageService() : IFileStorageService
{
    private readonly string _basePath = InitializeBasePath();

    private static string InitializeBasePath()
    {
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "storage");
        if (!Directory.Exists(basePath)) Directory.CreateDirectory(basePath);
        return basePath;
    }

    /// <summary>
    /// Stores raw bytes as a file and returns a storage id.
    /// </summary>
    /// <param name="data">File contents.</param>
    /// <param name="filename">Original filename (used for extension).</param>
    /// <returns>A storage id that can be used to retrieve the file.</returns>
    public async Task<string> StoreAsync(byte[] data, string filename)
    {
        var id = Guid.NewGuid().ToString("N") + Path.GetExtension(filename);
        var full = Path.Combine(_basePath, id);
        await File.WriteAllBytesAsync(full, data);
        return id;
    }

    /// <summary>
    /// Retrieves stored file bytes by storage id.
    /// </summary>
    /// <param name="storageId">The storage id returned from <see cref="StoreAsync"/>.</param>
    /// <returns>File bytes, or null if not found.</returns>
    public async Task<byte[]?> GetAsync(string storageId)
    {
        var full = Path.Combine(_basePath, storageId);
        if (!File.Exists(full)) return null;
        return await File.ReadAllBytesAsync(full);
    }

    /// <summary>
    /// Deletes a stored file by storage id if it exists.
    /// </summary>
    /// <param name="storageId">The storage id to delete.</param>
    public Task DeleteAsync(string storageId)
    {
        var full = Path.Combine(_basePath, storageId);
        if (File.Exists(full)) File.Delete(full);
        return Task.CompletedTask;
    }
}