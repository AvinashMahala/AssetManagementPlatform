using System;
using MyApp.Api.Requests;
using MyApp.Api.Responses;
using MyApp.Models;

namespace MyApp.Api.Mapping;

public static class UnitMappingExtensions
{
    public static UnitDto ToDto(this Unit u)
    {
        return new UnitDto(
            u.Id,
            u.PropertyId,
            u.UnitNumber,
            u.Name,
            u.Description,
            u.UnitType,
            u.Floor,
            u.Area,
            u.Bedrooms,
            u.Bathrooms,
            u.Balconies,
            u.Furnished,
            u.MaxOccupants,
            u.UnitAmenities,
            u.UnitPhotos,
            u.MonthlyRent,
            u.SecurityDeposit,
            u.MaintenanceCharges,
            u.Status,
            u.CreatedAt,
            u.UpdatedAt
        );
    }

    public static Unit ToEntity(this CreateUnitRequest req)
    {
        return new Unit
        {
            PropertyId = req.PropertyId,
            UnitNumber = req.UnitNumber,
            Name = req.Name,
            Description = req.Description,
            UnitType = req.UnitType,
            Floor = req.Floor,
            Area = req.Area,
            Bedrooms = req.Bedrooms,
            Bathrooms = req.Bathrooms,
            Balconies = req.Balconies,
            Furnished = req.Furnished,
            MaxOccupants = req.MaxOccupants,
            UnitAmenities = req.UnitAmenities,
            UnitPhotos = req.UnitPhotos,
            MonthlyRent = req.MonthlyRent,
            SecurityDeposit = req.SecurityDeposit,
            MaintenanceCharges = req.MaintenanceCharges,
            Status = req.Status ?? "available"
        };
    }

    public static void UpdateEntity(this Unit unit, UpdateUnitRequest req)
    {
        unit.PropertyId = req.PropertyId;
        unit.UnitNumber = req.UnitNumber;
        unit.Name = req.Name;
        unit.Description = req.Description;
        unit.UnitType = req.UnitType;
        unit.Floor = req.Floor;
        unit.Area = req.Area;
        unit.Bedrooms = req.Bedrooms;
        unit.Bathrooms = req.Bathrooms;
        unit.Balconies = req.Balconies;
        unit.Furnished = req.Furnished;
        unit.MaxOccupants = req.MaxOccupants;
        unit.UnitAmenities = req.UnitAmenities;
        unit.UnitPhotos = req.UnitPhotos;
        unit.MonthlyRent = req.MonthlyRent;
        unit.SecurityDeposit = req.SecurityDeposit;
        unit.MaintenanceCharges = req.MaintenanceCharges;
        unit.Status = req.Status;
    }
}
