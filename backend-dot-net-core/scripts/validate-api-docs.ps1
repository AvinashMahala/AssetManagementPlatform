param(
    [string]$ApiDocsRoot = "src/MyApp.Api/ApiDocs",
    [switch]$Fix,
    [switch]$Json
)

Set-StrictMode -Version Latest
$root = Join-Path (Get-Location) $ApiDocsRoot
if (-not (Test-Path $root)) { Write-Error "ApiDocs root not found: $root"; exit 2 }

$issues = @()

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
        $descPath = Join-Path $endpointDir.FullName 'description.md'
        if (-not (Test-Path $descPath)) {
            $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='missing description.md' }
            continue
        }

        $content = Get-Content -Raw $descPath
        $m = [regex]::Match($content, '\*\*Endpoint:\*\*\s*`(\w+)\s+([^`]+)`')
        if (-not $m.Success) {
            $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='missing Endpoint line in description.md' }
            if ($Fix) {
                # Try to infer from folder name if it contains an HTTP verb prefix
                if ($endpointDir.Name -match '^(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)[\._](.+)$') {
                    $verb = $matches[1]
                    $rest = $matches[2]
                    # Convert dots back into slashes and reinsert api/ prefix
                    $inferredRoute = '/' + ($rest -replace '\.', '/')
                    if (-not $inferredRoute.StartsWith('/api')) { $inferredRoute = '/api/' + ($inferredRoute.TrimStart('/')) }
                    $line = "`n**Endpoint:** `$verb $inferredRoute`n"
                    Add-Content -Path $descPath -Value $line
                    $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='auto-inserted Endpoint line (inferred from folder name)'; Details=$inferredRoute }
                    continue
                }
            }
            continue
        }

        $method = $m.Groups[1].Value.ToUpperInvariant()
        $route = $m.Groups[2].Value
        $norm = Normalize-Route $route
        if ([string]::IsNullOrWhiteSpace($norm)) {
            $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='normalized route empty' }
            continue
        }
        $expected = "$method.$norm"
        if ($endpointDir.Name -ne $expected) {
            $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='folder name mismatch'; Expected=$expected; Actual=$endpointDir.Name }
        }

        # Basic check: if route contains path params like {id} and there's no parameters.json, warn
        if ($route -match '\{[^}]+\}') {
            $paramsJson1 = Join-Path $endpointDir.FullName 'parameters.json'
            $paramsDir = Join-Path $endpointDir.FullName 'parameters'
            if (-not (Test-Path $paramsJson1) -and -not (Test-Path $paramsDir)) {
                $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='missing parameters.json or parameters/ for path params' }
            }
        }
    }
}

if ($Json) {
    $issues | ConvertTo-Json -Depth 5
} else {
    if ($issues.Count -eq 0) { Write-Host "No issues found."; exit 0 }
    Write-Host "Issues found:`n"
    $issues | Format-Table -AutoSize
    exit 1
}
