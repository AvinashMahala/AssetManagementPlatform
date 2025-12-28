using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Interfaces;
using MyApp.Models;

namespace MyApp.Services;

public class ReceiptTemplateService : IReceiptTemplateService
{
    private readonly IReceiptTemplateRepository _repo;

    public ReceiptTemplateService(IReceiptTemplateRepository repo) => _repo = repo;

    public Task<IEnumerable<ReceiptTemplate>> ListAsync() => _repo.ListAsync();

    public Task<ReceiptTemplate?> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

    public Task<ReceiptTemplate> CreateAsync(ReceiptTemplate template) => _repo.CreateAsync(template);

    public Task<ReceiptTemplate?> UpdateAsync(Guid id, ReceiptTemplate updates) => _repo.UpdateAsync(id, updates);

    public Task DeleteAsync(Guid id) => _repo.DeleteAsync(id);
}