using System;
using MyApp.Api.Requests;
using MyApp.Api.Responses;
using MyApp.Models;

namespace MyApp.Api.Mapping;

public static class PropertyMappingExtensions
{
    public static PropertyDto ToDto(this Property entity)
    {
        return new PropertyDto(
            entity.Id,
            entity.Name,
            entity.Description,
            entity.PropertyType,
            entity.Currency,
            entity.Address,
            entity.AddressCity,
            entity.AddressState,
            entity.AddressPincode,
            entity.AddressCountry,
            entity.AddressLandmark,
            entity.Area,
            entity.TotalFloors,
            entity.YearBuilt,
            entity.ParkingSpaces,
            entity.AmenitiesObject,
            entity.TemplateJson,
            entity.TemplateId,
            entity.ReceiptSettings,
            entity.OwnerId,
            entity.OwnerName,
            entity.OwnerMobileNumbersArray,
            entity.OwnerEmailIdsArray,
            entity.OwnerWebsite,
            entity.CoOwnersArray,
            entity.Status,
            entity.CreatedAt,
            entity.UpdatedAt
        );
    }

    public static Property ToEntity(this CreatePropertyRequest request)
    {
        return new Property
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            PropertyType = request.PropertyType,
            Currency = request.Currency,
            Address = request.Address ?? string.Empty,
            AddressCity = request.AddressCity,
            AddressState = request.AddressState,
            AddressPincode = request.AddressPincode,
            AddressCountry = request.AddressCountry,
            AddressLandmark = request.AddressLandmark,
            Area = request.Area,
            TotalFloors = request.TotalFloors,
            YearBuilt = request.YearBuilt,
            ParkingSpaces = request.ParkingSpaces,
            AmenitiesObject = request.Amenities,
            TemplateJson = request.TemplateJson,
            TemplateId = request.TemplateId,
            ReceiptSettings = request.ReceiptSettings,
            OwnerId = request.OwnerId,
            OwnerName = request.OwnerName,
            OwnerMobileNumbersArray = request.OwnerMobileNumbers ?? Array.Empty<string>(),
            OwnerEmailIdsArray = request.OwnerEmailIds ?? Array.Empty<string>(),
            OwnerWebsite = request.OwnerWebsite,
            CoOwnersArray = request.CoOwners ?? Array.Empty<Guid>(),
            Status = request.Status ?? "active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static void UpdateEntity(this Property entity, UpdatePropertyRequest request)
    {
        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.PropertyType = request.PropertyType;
        entity.Currency = request.Currency;
        entity.Address = request.Address ?? string.Empty;
        entity.AddressCity = request.AddressCity;
        entity.AddressState = request.AddressState;
        entity.AddressPincode = request.AddressPincode;
        entity.AddressCountry = request.AddressCountry;
        entity.AddressLandmark = request.AddressLandmark;
        entity.Area = request.Area;
        entity.TotalFloors = request.TotalFloors;
        entity.YearBuilt = request.YearBuilt;
        entity.ParkingSpaces = request.ParkingSpaces;
        entity.AmenitiesObject = request.Amenities;
        entity.TemplateJson = request.TemplateJson;
        entity.TemplateId = request.TemplateId;
        entity.ReceiptSettings = request.ReceiptSettings;
        entity.OwnerId = request.OwnerId;
        entity.OwnerName = request.OwnerName;
        entity.OwnerMobileNumbersArray = request.OwnerMobileNumbers ?? Array.Empty<string>();
        entity.OwnerEmailIdsArray = request.OwnerEmailIds ?? Array.Empty<string>();
        entity.OwnerWebsite = request.OwnerWebsite;
        entity.CoOwnersArray = request.CoOwners ?? Array.Empty<Guid>();
        if (request.Status != null) entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
    }
}
