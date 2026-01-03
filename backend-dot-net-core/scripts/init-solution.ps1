<#
Run this script from the `backend-dot-net-core` folder to create a solution and wire projects.
Requires: dotnet CLI (8+)
#>

param(
  [string]$SolutionName = "MyApp"
)

Write-Host "Creating solution: $SolutionName.sln"

dotnet new sln -n $SolutionName

Write-Host "Adding projects to solution"
dotnet sln add src/MyApp.Api/MyApp.Api.csproj
dotnet sln add src/MyApp.Models/MyApp.Models.csproj
dotnet sln add src/MyApp.Interfaces/MyApp.Interfaces.csproj
dotnet sln add src/MyApp.Services/MyApp.Services.csproj
dotnet sln add src/MyApp.Repositories/MyApp.Repositories.csproj

Write-Host "Creating test projects"
cd src
if (!(Test-Path "MyApp.Tests.Unit")) {
  dotnet new xunit -n MyApp.Tests.Unit -f net8.0
}
if (!(Test-Path "MyApp.Tests.Integration")) {
  dotnet new xunit -n MyApp.Tests.Integration -f net8.0
}
cd ..

Write-Host "Adding project references to tests"

dotnet add src/MyApp.Tests.Unit/MyApp.Tests.Unit.csproj reference src/MyApp.Services/MyApp.Services.csproj src/MyApp.Interfaces/MyApp.Interfaces.csproj src/MyApp.Models/MyApp.Models.csproj src/MyApp.Repositories/MyApp.Repositories.csproj

dotnet add src/MyApp.Tests.Integration/MyApp.Tests.Integration.csproj reference src/MyApp.Api/MyApp.Api.csproj

Write-Host "Restoring solution"
dotnet restore

Write-Host "Done. You can open $SolutionName.sln in your IDE."