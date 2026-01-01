namespace MyApp.Models;

public class PropertyAmenities
{
    public string[] Basic { get; set; } = new string[0];
    public string[] Luxury { get; set; } = new string[0];
    public AdditionalInfo AdditionalInfo { get; set; } = new AdditionalInfo();
}

public class AdditionalInfo
{
    public bool PetFriendly { get; set; }
    public bool SmokingAllowed { get; set; }
    public bool EventsAllowed { get; set; }
}
