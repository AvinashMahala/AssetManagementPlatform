using System.Threading.Tasks;

namespace MyApp.Interfaces;

public partial interface IFileStorageService
{
    Task<string> StoreAsync(byte[] data, string filename);
    Task<byte[]?> GetAsync(string storageId);
    Task DeleteAsync(string storageId);
}