# TODO
# https://github.com/actions/runner-images/issues/8900
# PSNativeCommandUseErrorActionPreference = $true

function checkLastExitCode() {
    if ($LASTEXITCODE) {
        Write-Error "Command exit code indicates failure: $LASTEXITCODE"
        Exit $LASTEXITCODE
    }
}
