<#
Migrate ApiDocs single-file JSON sidecars into per-endpoint folder layout.

Usage: .\migrate-api-docs-to-folders.ps1 -DocsRoot "path\to\ApiDocs" -WhatIf

This script will:
 - create endpoint folders named {Action}.{HTTPMETHOD} under each controller folder
 - move matching `{Action}.{HTTPMETHOD}.md` into `description.md` inside endpoint folder
 - for each `{Action}.{HTTPMETHOD}.json` file: split `requestBody` into `request.json` and each `responses`[status] into `responses/<status>.json`
 - keep original `.json` files as `.bak` for safety
#>
[CmdletBinding(SupportsShouldProcess=$true)]
param(
    [string]$DocsRoot = "$(Resolve-Path "$(Join-Path $PSScriptRoot '..\ApiDocs')")",
    [switch]$VerboseOutput
)

function Log($m) { if ($VerboseOutput) { Write-Host $m } }

$httpMethods = 'GET','POST','PUT','DELETE','PATCH'

if (-not (Test-Path $DocsRoot)) { throw "ApiDocs root not found: $DocsRoot" }

Get-ChildItem -Path $DocsRoot -Directory | Where-Object { $_.Name -ne 'Tags' } | ForEach-Object {
    $controllerDir = $_.FullName
    Log "Inspecting controller folder: $($_.Name)"

    foreach ($method in $httpMethods) {
        $pattern = "*.${method}.json"
        Get-ChildItem -Path $controllerDir -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
            $file = $_.FullName
            if ($file -match '^(.*)\.(' + $method + ')\.json$') {
                $action = $_.BaseName.Substring(0, $_.BaseName.Length - ($method.Length + 1))
                $endpointFolder = Join-Path $controllerDir ("$action.$method")

                if ($PSCmdlet.ShouldProcess("Create folder $endpointFolder and migrate $file")) {
                    New-Item -ItemType Directory -Path $endpointFolder -Force | Out-Null

                    # Move related markdown if exists
                    $mdName1 = Join-Path $controllerDir "$action.$method.md"
                    $mdName2 = Join-Path $controllerDir "$action.$method.MD"
                    if (Test-Path $mdName1) { Move-Item -Path $mdName1 -Destination (Join-Path $endpointFolder 'description.md') -Force }
                    elseif (Test-Path $mdName2) { Move-Item -Path $mdName2 -Destination (Join-Path $endpointFolder 'description.md') -Force }

                    # Read JSON and split
                    try {
                        $json = Get-Content $file -Raw | ConvertFrom-Json -ErrorAction Stop

                        # requestBody => request.json
                        if ($json.requestBody -ne $null) {
                            $reqObj = @{}
                            if ($json.requestBody.content -ne $null) { $reqObj.content = $json.requestBody.content }
                            elseif ($json.requestBody.example -ne $null) { $reqObj.example = $json.requestBody.example }
                            $reqJson = $reqObj | ConvertTo-Json -Depth 10
                            $dest = Join-Path $endpointFolder 'request.json'
                            if ($PSCmdlet.ShouldProcess("Write $dest")) { $reqJson | Out-File -FilePath $dest -Encoding utf8 }
                        }

                        # responses => responses/<status>.json
                        if ($json.responses -ne $null) {
                            $responsesDir = Join-Path $endpointFolder 'responses'
                            New-Item -ItemType Directory -Path $responsesDir -Force | Out-Null
                            foreach ($prop in $json.responses.psobject.Properties) {
                                $status = $prop.Name
                                $obj = $json.responses.$status
                                $dest = Join-Path $responsesDir ("$status.json")
                                $obj | ConvertTo-Json -Depth 10 | Out-File -FilePath $dest -Encoding utf8
                            }
                        }

                        # If top-level content/example present (legacy), put into request.json by default
                        elseif ($json.content -ne $null -or $json.example -ne $null) {
                            $reqObj = @{}
                            if ($json.content -ne $null) { $reqObj.content = $json.content }
                            if ($json.example -ne $null) { $reqObj.example = $json.example }
                            $reqObj | ConvertTo-Json -Depth 10 | Out-File -FilePath (Join-Path $endpointFolder 'request.json') -Encoding utf8
                        }

                        # Keep backup
                        Copy-Item -Path $file -Destination ($file + '.bak') -Force

                        # Optionally remove original
                        # Remove-Item -Path $file -Force

                        Write-Host "Migrated $file -> $endpointFolder"
                    }
                    catch {
                        Write-Warning ([string]::Format("Failed to parse {0}: {1}", $file, $_.Exception.Message))
                    }
                }
            }
        }
    }
}

Write-Host "Migration complete. Verify files under $DocsRoot and commit .bak files for safety."