Import-Module $PSScriptRoot/Utilities.psm1

Write-Host "Lint workspace"
yarn lint
checkLastExitCode

Write-Host "Run tests"
yarn test:coverage:prod
checkLastExitCode

Write-Host "Run benchmarks"
Write-Host "Disabled for now; probably due to https://github.com/tinylibs/tinybench/issues/83"
# yarn bench:prod
# checkLastExitCode
