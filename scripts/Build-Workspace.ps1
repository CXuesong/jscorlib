Import-Module $PSScriptRoot/Utilities.psm1

yarn g:build:prod
checkLastExitCode
