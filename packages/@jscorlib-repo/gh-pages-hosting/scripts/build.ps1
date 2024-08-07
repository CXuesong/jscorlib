[CmdletBinding()]
param (
    [Parameter()]
    [Switch]
    $CollectResources
)

$ErrorActionPreference = "Stop"

if (-not $env:npm_execpath) {
    Write-Warning "This script is not intended to be executed directly. Please use `yarn build` instead."
}

vite build
if ($LASTEXITCODE) { exit $LASTEXITCODE }

$OutputDir = (Resolve-Path $PSScriptRoot/../dist).Path
Write-Host "OutputDir=$OutputDir"

$WorkspaceRootDir = (Resolve-Path $PSScriptRoot/../../../..).Path
Write-Host "WorkspaceRootDir=$WorkspaceRootDir"

if ($CollectResources) {
    $DocumentationOutputDir = "$WorkspaceRootDir/packages/@jscorlib-repo/documentations/dist"
    Write-Host "Copy docs: $DocumentationOutputDir"
    Copy-Item -Recurse $DocumentationOutputDir $OutputDir/docs/latest

    Write-Host "Copy coverage reports"
    function CopyCoverageReport([Parameter(Mandatory = $true)][string]$PackageName) {
        $CoverageDir = "$WorkspaceRootDir/packages/$PackageName/obj/coverage/lcov-report"
        $TargetDir = "$OutputDir/coverage/latest/$PackageName"
        Write-Host "  $CoverageDir -> $TargetDir"
        Copy-Item -Recurse $CoverageDir $TargetDir
    }

    CopyCoverageReport jscorlib
    CopyCoverageReport @jscorlib/polyfills
}
