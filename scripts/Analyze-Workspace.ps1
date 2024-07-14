Import-Module $PSScriptRoot/Utilities.psm1

Write-Host "Lint workspace"
yarn lint
checkLastExitCode

Write-Host "Run tests"
yarn test:prod
checkLastExitCode

Write-Host "Run benchmarks"
yarn test:prod
checkLastExitCode
