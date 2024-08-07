Import-Module $PSScriptRoot/Utilities.psm1

Write-Host "Build @jscorlib-repo/gh-pages-hosting"
yarn workspace @jscorlib-repo/gh-pages-hosting build:collect-resources
checkLastExitCode
