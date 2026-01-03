param(
    [string]$ApiDocsRoot = "src/MyApp.Api/ApiDocs",
    [switch]$Apply
)

$root = Join-Path (Get-Location) $ApiDocsRoot
if (-not (Test-Path $root)) { Write-Error "ApiDocs root not found: $root"; exit 1 }

$mapping = @()

function Normalize-Route($route) {
    $r = $route.Trim()
    $r = $r.TrimStart('/')
    if ($r.StartsWith('api/')) { $r = $r.Substring(4) }
    # remove route constraints inside braces: {id:guid} -> {id}
    $r = [regex]::Replace($r, '\{([^:}]+):[^}]+\}', '{$1}')
    # replace slashes with dots
    $r = $r -replace '/', '.'
    # remove duplicate dots
    $r = $r -replace '\.\.+', '.'
    return $r
}

foreach ($controllerDir in Get-ChildItem -Path $root -Directory) {
    foreach ($endpointDir in Get-ChildItem -Path $controllerDir.FullName -Directory) {
        $desc = Join-Path $endpointDir.FullName 'description.md'
        if (-not (Test-Path $desc)) {
            Write-Warning "No description.md in $($endpointDir.FullName) - skipping"
            continue
        }

        $content = Get-Content -Raw $desc
        $m = [regex]::Match($content, '\*\*Endpoint:\*\*\s*`(\w+)\s+([^`]+)`')
        if (-not $m.Success) {
            Write-Warning "No Endpoint line found in $($endpointDir.FullName) - skipping"
            continue
        }

        $method = $m.Groups[1].Value.ToUpperInvariant()
        $route = $m.Groups[2].Value
        $norm = Normalize-Route $route
        if ([string]::IsNullOrWhiteSpace($norm)) {
            Write-Warning "Normalized route empty for $($endpointDir.FullName) - skipping"
            continue
        }

        $newName = "$method.$norm"
        $newDir = Join-Path $controllerDir.FullName $newName
        $mapping += [pscustomobject]@{
            Controller = $controllerDir.Name
            OldName = $endpointDir.Name
            OldPath = $endpointDir.FullName
            NewName = $newName
            NewPath = $newDir
            Endpoint = $route
            Method = $method
        }
    }
}

if ($mapping.Count -eq 0) { Write-Host "No endpoint folders found to migrate."; exit 0 }

Write-Host "Planned migrations:`n"
$mapping | Format-Table -AutoSize

if ($Apply) {
    Write-Host "Applying migrations..."
    foreach ($m in $mapping) {
        if (Test-Path $m.NewPath) {
            Write-Error "Target path already exists: $($m.NewPath). Aborting."
            exit 1
        }
        Move-Item -Path $m.OldPath -Destination $m.NewPath
        Write-Host "Renamed $($m.OldName) -> $($m.NewName)"
    }
    # write manifest
    $manifest = @{ timestamp = (Get-Date).ToString('o'); migrations = $mapping }
    $manifestPath = Join-Path $root "migration-manifest-$(Get-Date -Format yyyyMMdd-HHmmss).json"
    $manifest | ConvertTo-Json -Depth 5 | Out-File -FilePath $manifestPath -Encoding UTF8
    Write-Host "Migrations applied. Manifest written to $manifestPath"
} else {
    Write-Host "Dry-run complete. Re-run with -Apply to perform renames."
}
