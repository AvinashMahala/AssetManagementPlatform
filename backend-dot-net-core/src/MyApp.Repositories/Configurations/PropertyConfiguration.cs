using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class PropertyConfiguration : IEntityTypeConfiguration<Property>
{
    public void Configure(EntityTypeBuilder<Property> builder)
    {
        builder.ToTable("properties");

        // Column mappings (best-effort mapping against current DB schema)
        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.Name).HasColumnName("name");

        builder.Property(p => p.Description).HasColumnName("description");
        builder.Property(p => p.PropertyType).HasColumnName("property_type").HasMaxLength(100);
        builder.Property(p => p.Currency).HasColumnName("currency").HasMaxLength(10);

        // The model stores a single 'Address' string; map to street component for now
        builder.Property(p => p.Address).HasColumnName("address_street").HasMaxLength(255);
        builder.Property(p => p.AddressCity).HasColumnName("address_city").HasMaxLength(100);
        builder.Property(p => p.AddressState).HasColumnName("address_state").HasMaxLength(100);
        builder.Property(p => p.AddressPincode).HasColumnName("address_pincode").HasMaxLength(10);
        builder.Property(p => p.AddressCountry).HasColumnName("address_country").HasMaxLength(100);
        builder.Property(p => p.AddressLandmark).HasColumnName("address_landmark").HasMaxLength(255);

        builder.Property(p => p.Area).HasColumnName("area");
        builder.Property(p => p.TotalFloors).HasColumnName("total_floors");
        builder.Property(p => p.YearBuilt).HasColumnName("year_built");
        builder.Property(p => p.ParkingSpaces).HasColumnName("parking_spaces");

        builder.Property(p => p.Amenities).HasColumnName("amenities").HasColumnType("jsonb");

        builder.Property(p => p.OwnerId).HasColumnName("owner_id");
        builder.Property(p => p.OwnerName).HasColumnName("owner_name").HasMaxLength(255);
        builder.Property(p => p.OwnerMobileNumbers).HasColumnName("owner_mobile_numbers").HasColumnType("jsonb");
        builder.Property(p => p.OwnerEmailIds).HasColumnName("owner_email_ids").HasColumnType("jsonb");
        builder.Property(p => p.OwnerWebsite).HasColumnName("owner_website").HasMaxLength(500);
        builder.Property(p => p.CoOwners).HasColumnName("co_owners").HasColumnType("jsonb");

        builder.Property(p => p.TemplateId).HasColumnName("template_id");
        // TemplateJson is a JSON blob for overrides
        builder.Property(p => p.TemplateJson).HasColumnName("template_overrides").HasColumnType("jsonb");
        builder.Property(p => p.ReceiptSettings).HasColumnName("receipt_settings").HasColumnType("jsonb");

        builder.Property(p => p.Status).HasColumnName("status").HasMaxLength(50);

        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");

        // Add additional indexes and relationships here
    }
}