[CmdletBinding()]
param (
    [Parameter()]
    [Switch]
    $Prod
)

if (-not $env:npm_execpath) {
    Write-Warning "This script is not intended to be executed directly. Please use `yarn build` instead."
}

if (-not $Prod) {
    Write-Warning "Skipped documentations build in DEV build mode. To build the documentations, use `yarn build:prod` instead."
    return
}

Remove-Item ./dist -Recurse -Force -ErrorAction SilentlyContinue

typedoc
if ($LASTEXITCODE) { exit $LASTEXITCODE }
