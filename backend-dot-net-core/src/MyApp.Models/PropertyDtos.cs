using System;

namespace MyApp.Models;

public record CreatePropertyRequest(string Name, string Address, Guid? OwnerId);
public record UpdatePropertyRequest(string Name, string Address, Guid? OwnerId);
public record PropertyDto(Guid Id, string Name, string Address, Guid? OwnerId, string Status);
public record SetTemplateRequest(string TemplateJson);