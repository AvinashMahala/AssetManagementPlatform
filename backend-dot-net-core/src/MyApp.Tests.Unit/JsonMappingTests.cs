using System;
using Xunit;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace MyApp.Tests.Unit;

public class JsonMappingTests
{
    [Fact]
    public void Property_Amenities_Wrapper_Works()
    {
        var p = new MyApp.Models.Property();
        p.AmenitiesObject = new MyApp.Models.PropertyAmenities
        {
            Basic = new[] { "wifi", "parking" },
            Luxury = new string[0],
            AdditionalInfo = new MyApp.Models.AdditionalInfo { PetFriendly = true }
        };

        Assert.NotNull(p.Amenities);
        Assert.Contains("wifi", p.Amenities);

        var parsed = p.AmenitiesObject;
        Assert.True(parsed.AdditionalInfo.PetFriendly);
    }

    [Fact]
    public void Property_OwnerMobileNumbers_Array_Wrapper_Works()
    {
        var p = new MyApp.Models.Property();
        p.OwnerMobileNumbersArray = new[] { "123", "456" };
        Assert.Contains("123", p.OwnerMobileNumbers);
        Assert.Equal(2, p.OwnerMobileNumbersArray.Length);
    }

    [Fact]
    public void Receipt_ReceiptData_Wrapper_Works()
    {
        var r = new MyApp.Models.Receipt();
        var node = JsonNode.Parse("{\"key\": \"value\"}");
        r.ReceiptDataJson = node;

        Assert.NotNull(r.ReceiptData);
        var parsed = JsonNode.Parse(r.ReceiptData);
        Assert.Equal("value", parsed!["key"]!.ToString());
    }
}
