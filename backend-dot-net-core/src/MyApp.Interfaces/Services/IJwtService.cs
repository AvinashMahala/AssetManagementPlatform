using System;
using MyApp.Models;

namespace MyApp.Interfaces;

public partial interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}