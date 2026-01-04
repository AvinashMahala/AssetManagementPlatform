using System;
using MyApp.Api.Requests;
using MyApp.Api.Responses;
using MyApp.Models;

namespace MyApp.Api.Mapping;

public static class MeterMappingExtensions
{
    public static MeterDto ToDto(this Meter entity)
    {
        return new MeterDto(
            entity.Id,
            entity.PropertyId,
            entity.UnitId,
            entity.MeterNumber,
            entity.MeterType,
            entity.MeterName,
            entity.Multiplier,
            entity.CostPerUnit,
            entity.FixedCharge,
            entity.Remarks,
            entity.InstallationDate,
            entity.Status,
            entity.IsActive,
            entity.CreatedAt,
            entity.UpdatedAt
        );
    }

    public static Meter ToEntity(this CreateMeterRequest req)
    {
        return new Meter
        {
            Id = Guid.NewGuid(),
            PropertyId = req.PropertyId,
            UnitId = req.UnitId,
            MeterNumber = req.MeterNumber,
            MeterType = req.MeterType,
            MeterName = req.MeterName,
            Multiplier = req.Multiplier,
            CostPerUnit = req.CostPerUnit,
            FixedCharge = req.FixedCharge,
            Remarks = req.Remarks,
            InstallationDate = req.InstallationDate,
            Status = req.Status ?? "active",
            IsActive = req.IsActive ?? true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static void UpdateEntity(this Meter entity, UpdateMeterRequest req)
    {
        entity.PropertyId = req.PropertyId;
        entity.UnitId = req.UnitId;
        entity.MeterNumber = req.MeterNumber;
        entity.MeterType = req.MeterType;
        entity.MeterName = req.MeterName;
        entity.Multiplier = req.Multiplier;
        entity.CostPerUnit = req.CostPerUnit;
        entity.FixedCharge = req.FixedCharge;
        entity.Remarks = req.Remarks;
        entity.InstallationDate = req.InstallationDate;
        entity.Status = req.Status;
        entity.IsActive = req.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
    }
}
