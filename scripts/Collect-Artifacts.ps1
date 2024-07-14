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
Copy-Item ./packages $ArtifactPath/
