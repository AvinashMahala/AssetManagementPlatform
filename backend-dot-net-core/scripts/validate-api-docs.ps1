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

        # Front-matter tags check: ensure tags exist in the YAML front-matter
        $fm = [regex]::Match($content, '(?s)^---\s*(.*?)\s*---')
        if (-not $fm.Success) {
            $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='missing front-matter block' }
            if ($Fix) {
                $tagsLine = "tags: [$($controllerDir.Name)]"
                $newFm = "---`n$tagsLine`n---`n"
                $newContent = $newFm + $content
                Set-Content -Path $descPath -Value $newContent -Encoding UTF8
                $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='auto-inserted front-matter with tags'; Details=$tagsLine }
            }
        } else {
            $fmBody = $fm.Groups[1].Value
            if ($fmBody -notmatch '(^|\s)tags\s*:') {
                $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='missing tags in front-matter' }
                if ($Fix) {
                    $insert = "tags: [$($controllerDir.Name)]`n"
                    $newContent = $content -replace '(?s)^---\s*(.*?)\s*---', "---`n$1`n$insert---"
                    Set-Content -Path $descPath -Value $newContent -Encoding UTF8
                    $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='auto-inserted tags into front-matter'; Details=($controllerDir.Name) }
                }
            } else {
                # ensure tags is not empty like tags: []
                if ($fmBody -match 'tags\s*:\s*\[\s*\]') {
                    $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='empty tags in front-matter' }
                }
            }
        }

        # Responses folder check: ensure numeric response files exist and contain expected status codes
        $responsesDir = Join-Path $endpointDir.FullName 'responses'
        $expected = switch ($method) {
            'GET' { @(200,404) }
            'POST' { @(201,200) }
            'PUT' { @(200,204) }
            'PATCH' { @(200,204) }
            'DELETE' { @(204,200) }
            default { @() }
        }
        if (-not (Test-Path $responsesDir)) {
            if ($Fix -and $expected.Count -gt 0) {
                # Auto-create minimal responses folder and a first expected status file
                New-Item -Path $responsesDir -ItemType Directory | Out-Null
                $first = $expected[0]
                if ($first -eq 204) {
                    $payload = @"
{
  "description": "No Content"
}
"@
                } elseif ($method -eq 'GET' -and $first -eq 200) {
                    $payload = @"
{
  "description": "OK",
  "content": {
    "application/json": {
      "examples": { "default": { "value": [] } }
    }
  }
}
"@
                } else {
                    $idExample = '"00000000-0000-0000-0000-000000000000"'
                    $payload = @"
{
  "description": "OK",
  "content": {
    "application/json": {
      "examples": { "default": { "value": { "id": $idExample } } }
    }
  }
}
"@
                }
                $outPath = Join-Path $responsesDir ("$first.json")
                Set-Content -Path $outPath -Value $payload -Encoding UTF8
                $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='auto-created responses file'; File = ("responses/$first.json") }
            } else {
                $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='missing responses/ folder or response files' }
            }
        } else {
            $responseFiles = @(Get-ChildItem -Path $responsesDir -File | Where-Object { $_.Name -match '^\d+\.json$' })
            if ($responseFiles.Count -eq 0) {
                $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='responses folder contains no numeric status files' }
            } else {
                $codes = $responseFiles | ForEach-Object { [int]([regex]::Match($_.Name,'^(\d+)').Groups[1].Value) }
                if ($expected.Count -gt 0) {
                    $foundExpected = $false
                    foreach ($e in $expected) { if ($codes -contains $e) { $foundExpected = $true; break } }
                    if (-not $foundExpected) {
                        if ($Fix -and $expected.Count -gt 0) {
                            # Auto-create first expected missing file
                            $first = $expected[0]
                            if ($first -eq 204) {
                                $payload = @"
{
  "description": "No Content"
}
"@
                            } elseif ($method -eq 'GET' -and $first -eq 200) {
                                $payload = @"
{
  "description": "OK",
  "content": {
    "application/json": {
      "examples": { "default": { "value": [] } }
    }
  }
}
"@
                            } else {
                                $idExample = '"00000000-0000-0000-0000-000000000000"'
                                $payload = @"
{
  "description": "OK",
  "content": {
    "application/json": {
      "examples": { "default": { "value": { "id": $idExample } } }
    }
  }
}
"@
                            }
                            $outPath = Join-Path $responsesDir ("$first.json")
                            Set-Content -Path $outPath -Value $payload -Encoding UTF8
                            $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='auto-created expected response file'; File = ("responses/$first.json") }
                        } else {
                            $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='missing expected response codes'; Expected=($expected -join ','); Found=($codes -join ',') }
                        }
                    }
                }
            }
        }

        # Validate parameters.json (if present) is valid JSON and entries include 'in'
        $paramsJson1 = Join-Path $endpointDir.FullName 'parameters.json'
        if (Test-Path $paramsJson1) {
            try {
                $pj = Get-Content -Raw $paramsJson1 | ConvertFrom-Json -ErrorAction Stop
                foreach ($name in $pj.PSObject.Properties.Name) {
                    $entry = $pj.$name
                    if ($null -eq $entry.PSObject.Properties['in']) {
                        $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue = 'parameters.json missing "in" for parameter'; Parameter=$name }
                    }
                }
            } catch {
                $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='parameters.json invalid JSON'; Details=($_.Exception.Message) }
            }
        }

        # Ensure summary exists in front-matter
        if ($fm.Success) {
            if ($fmBody -notmatch '(^|\s)summary\s*:') {
                $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='missing summary in front-matter' }
                if ($Fix) {
                    # derive summary from first non-empty line after front-matter but before Endpoint
                    $rest = $content.Substring($fm.Index + $fm.Length).Trim()
                    $lines = $rest -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' -and $_ -notmatch '^\*\*Endpoint:\*\*' }
                    $sLine = if ($lines.Count -gt 0) { $lines[0] } else { 'TODO: Add summary' }
                    $newContent = $content -replace '(?s)^---\s*(.*?)\s*---', "---`n$1`nsummary: $sLine`n---"
                    Set-Content -Path $descPath -Value $newContent -Encoding UTF8
                    $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='auto-inserted summary into front-matter'; Details=$sLine }
                }
            }
        }

        # For methods that usually require a request body, ensure request.json exists
        if ($method -in @('POST','PUT','PATCH')) {
            $reqPath = Join-Path $endpointDir.FullName 'request.json'
            if (-not (Test-Path $reqPath)) {
                $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='missing request.json for body-bearing method' }
                if ($Fix) {
                    $exampleBody = if ($method -eq 'POST') { '{ "name": "Example" }' } else { '{ "status": "active" }' }
                    Set-Content -Path $reqPath -Value $exampleBody -Encoding UTF8
                    $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='auto-created request.json'; File='request.json' }
                }
            }
        }

        # Ensure response files include examples; add minimal example when -Fix
        if (Test-Path $responsesDir) {
            foreach ($rf in $responseFiles) {
                try {
                    $robj = (Get-Content -Raw $rf.FullName) | ConvertFrom-Json -ErrorAction Stop
                    $hasExample = $false
                    if ($robj.content -and $robj.content.'application/json') {
                        $cj = $robj.content.'application/json'
                        if ($cj.examples -or $cj.example) { $hasExample = $true }
                    }
                    if (-not $hasExample) {
                        $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='response file missing examples'; File=$rf.Name }
                        if ($Fix) {
                            if (-not $robj.content) { $robj | Add-Member -NotePropertyName content -NotePropertyValue @{ 'application/json' = @{ examples = @{ default = @{ value = @{} } } } } -Force }
                            elseif (-not $robj.content.'application/json') { $robj.content | Add-Member -NotePropertyName 'application/json' -NotePropertyValue @{ examples = @{ default = @{ value = @{} } } } -Force }
                            else { $robj.content.'application/json'.examples = @{ default = @{ value = @{} } } }
                            $robj | ConvertTo-Json -Depth 10 | Set-Content -Path $rf.FullName -Encoding UTF8
                            $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='auto-inserted example into response'; File=$rf.Name }
                        }
                    }
                } catch {
                    $issues += [pscustomobject]@{ Controller=$controllerDir.Name; Folder=$endpointDir.Name; Issue='response file invalid JSON'; File=$rf.Name; Details=($_.Exception.Message) }
                }
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
