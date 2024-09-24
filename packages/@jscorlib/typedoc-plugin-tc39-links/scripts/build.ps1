[CmdletBinding()]
param (
    [Parameter()]
    [Switch]
    $Clean
)

if (-not $env:npm_execpath) {
    Write-Warning "This script is not intended to be executed directly. Please use `yarn build` instead."
}

if ($Clean) {
    Remove-Item ./lib -Recurse -Force -ErrorAction SilentlyContinue
}

tsc --project ./src/tsconfig.json
if ($LASTEXITCODE) { exit $LASTEXITCODE }
