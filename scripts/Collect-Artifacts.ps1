<#
.SYNOPSIS
Collects built packages as artifacts.
Assumes $PWD is the repo root.
#>
param (
    [Parameter(Mandatory = $true)]
    [string]$ArtifactPath
)

Import-Module $PSScriptRoot/Utilities.psm1

$ArtifactPath = (New-Item $ArtifactPath -ItemType Directory -Force).FullName

Write-Host "ArtifactPath=$ArtifactPath"

Write-Host
$WorkspacePackagesPath = (New-Item $ArtifactPath/workspace-packages -ItemType Directory -Force).FullName
Write-Host "WorkspacePackagesPath=$ArtifactPath"

$Packages = yarn workspaces list --json | ConvertFrom-Json
checkLastExitCode

foreach ($Package in $Packages) {
    Write-Host "$($Package.name) [$($Package.location)]"
    $SrcPath = (Resolve-Path $Package.location).Path
    Write-Host "  $SrcPath"

    $DestRelPath = $Package.location -replace "^packages/", ""
    $DestPath = (New-Item $WorkspacePackagesPath/$DestRelPath -ItemType Directory -Force).FullName
    Write-Host "  -> $DestPath"

    function Copy-PackageItem([string]$RelPath, [switch]$Recurse) {
        if (Test-Path $SrcPath/$RelPath) {
            Write-Host "  $RelPath"
            Copy-Item -Recurse:$Recurse $SrcPath/$RelPath $DestPath/
        }
    }

    Copy-PackageItem src -Recurse
    Copy-PackageItem obj -Recurse
    Copy-PackageItem lib -Recurse
    Copy-PackageItem dist -Recurse
    Copy-PackageItem package.json
    Copy-PackageItem *.md

    Write-Host
}
