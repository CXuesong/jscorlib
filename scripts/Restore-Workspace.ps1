Import-Module $PSScriptRoot/Utilities.psm1

# Assumes $PWD is repo root
yarn install --frozen-lockfile
checkLastExitCode
