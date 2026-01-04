using System;
using MyApp.Api.Requests;
using MyApp.Api.Responses;
using MyApp.Models;
using MyApp.Interfaces;

namespace MyApp.Api.Mapping;

public static class UserMappingExtensions
{
    public static UserDto ToDto(this User u)
    {
        return new UserDto
        {
            Id = u.Id,
            Email = u.Email,
            Username = u.Username,
            DisplayName = u.DisplayName,
            Phone = u.Phone,
            Role = u.Role,
            ProfilePicture = u.ProfilePicture,
            IsEmailVerified = u.IsEmailVerified,
            IsPhoneVerified = u.IsPhoneVerified,
            LastLogin = u.LastLogin,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt
        };
    }

    public static User ToEntity(this CreateUserRequest req)
    {
        return new User
        {
            Email = req.Email,
            Username = req.Username,
            PasswordHash = req.Password, // Note: Service should handle hashing if not already hashed
            DisplayName = req.DisplayName,
            Phone = req.Phone,
            Role = req.Role ?? "user",
            ProfilePicture = req.ProfilePicture
        };
    }

    public static void UpdateEntity(this User user, UpdateUserRequest req)
    {
        user.Email = req.Email;
        user.Username = req.Username;
        user.DisplayName = req.DisplayName;
        user.Phone = req.Phone;
        user.Role = req.Role;
        user.ProfilePicture = req.ProfilePicture;
        user.IsEmailVerified = req.IsEmailVerified;
        user.IsPhoneVerified = req.IsPhoneVerified;
    }
}
