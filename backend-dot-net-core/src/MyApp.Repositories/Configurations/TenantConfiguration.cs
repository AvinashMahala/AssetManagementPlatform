using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyApp.Models;

namespace MyApp.Repositories.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("tenants");

        builder.Property(t => t.Id).HasColumnName("id");
        builder.Property(t => t.FirstName).HasColumnName("first_name");
        builder.Property(t => t.LastName).HasColumnName("last_name");
        builder.Property(t => t.Email).HasColumnName("email");

        builder.Property(t => t.Phone).HasColumnName("phone");
        builder.Property(t => t.AlternatePhone).HasColumnName("alternate_phone");
        builder.Property(t => t.DateOfBirth).HasColumnName("date_of_birth");
        builder.Property(t => t.Gender).HasColumnName("gender");
        builder.Property(t => t.Occupation).HasColumnName("occupation");
        builder.Property(t => t.CompanyName).HasColumnName("company_name");
        builder.Property(t => t.MonthlyIncome).HasColumnName("monthly_income");

        builder.Property(t => t.CurrentAddressStreet).HasColumnName("current_address_street");
        builder.Property(t => t.CurrentAddressCity).HasColumnName("current_address_city");
        builder.Property(t => t.CurrentAddressState).HasColumnName("current_address_state");
        builder.Property(t => t.CurrentAddressPincode).HasColumnName("current_address_pincode");

        builder.Property(t => t.PermanentAddressStreet).HasColumnName("permanent_address_street");
        builder.Property(t => t.PermanentAddressCity).HasColumnName("permanent_address_city");
        builder.Property(t => t.PermanentAddressState).HasColumnName("permanent_address_state");
        builder.Property(t => t.PermanentAddressPincode).HasColumnName("permanent_address_pincode");

        builder.Property(t => t.EmergencyContactName).HasColumnName("emergency_contact_name");
        builder.Property(t => t.EmergencyContactRelationship).HasColumnName("emergency_contact_relationship");
        builder.Property(t => t.EmergencyContactPhone).HasColumnName("emergency_contact_phone");

        builder.Property(t => t.Status).HasColumnName("status");
        builder.Property(t => t.TotalRentals).HasColumnName("total_rentals");
        builder.Property(t => t.CurrentPropertyId).HasColumnName("current_property_id");

        builder.Property(t => t.CreatedAt).HasColumnName("created_at");
        builder.Property(t => t.UpdatedAt).HasColumnName("updated_at");
    }
}
