[CmdletBinding()]
param(
    [string]$MacHost = "dungeon-mac",
    [string]$ModelId = "qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled",
    [string]$EmbeddingModelId = "text-embedding-nomic-embed-text-v1.5",
    [string]$TranscriptRoot = "C:\Users\knigh\OneDrive\Desktop\exam\Term 6 Clean Transcripts",
    [ValidateRange(1024, 65535)][int]$AppPort = 8099,
    [ValidateRange(1024, 65535)][int]$LocalModelPort = 12340,
    [ValidateRange(1, 65535)][int]$MacModelPort = 1234,
    [switch]$HealthOnly
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$graderTool = Join-Path $PSScriptRoot "local-grader.mjs"

if (-not (Test-Path -LiteralPath $TranscriptRoot -PathType Container)) {
    throw "Transcript directory not found: $TranscriptRoot"
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js 20 or newer is required."
}
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw "Python is required to run Dungeon's local server."
}

$listener = Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort $LocalModelPort -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
    $forward = "127.0.0.1:{0}:127.0.0.1:{1}" -f $LocalModelPort, $MacModelPort
    $sshArgs = @(
        "-N", "-L", $forward,
        "-o", "BatchMode=yes",
        "-o", "ExitOnForwardFailure=yes",
        "-o", "ServerAliveInterval=30",
        "-o", "ServerAliveCountMax=3",
        $MacHost
    )
    Start-Process -FilePath (Get-Command ssh).Source -ArgumentList $sshArgs -WindowStyle Hidden | Out-Null
}

$modelBaseUrl = "http://127.0.0.1:$LocalModelPort/v1"
$models = $null
foreach ($attempt in 1..10) {
    try {
        $models = Invoke-RestMethod -Uri "$modelBaseUrl/models" -TimeoutSec 3
        break
    } catch {
        Start-Sleep -Milliseconds 500
    }
}
if (-not $models) {
    throw "The private Mac model tunnel did not become ready. Confirm Mullvad is disconnected and run: ssh $MacHost"
}
$loadedIds = @($models.data | ForEach-Object { $_.id })
if ($loadedIds -notcontains $ModelId) {
    throw "The owner-approved model is not loaded in LM Studio: $ModelId"
}
if ($loadedIds -notcontains $EmbeddingModelId) {
    throw "The course-retrieval embedding model is not loaded in LM Studio: $EmbeddingModelId"
}

$env:DUNGEON_TRANSCRIPTS = $TranscriptRoot
$env:DUNGEON_GRADER_MODEL = $ModelId
$env:DUNGEON_GRADER_APPROVED_MODEL = $ModelId
$env:DUNGEON_LOCAL_GRADER = "on"
$env:DUNGEON_EMBEDDING_MODEL = $EmbeddingModelId
$env:LM_STUDIO_BASE_URL = $modelBaseUrl

$healthText = & node $graderTool --health
if ($LASTEXITCODE -ne 0) { throw "Dungeon's local grader health check failed." }
$health = $healthText | ConvertFrom-Json
if (-not $health.available) { throw "Dungeon's local grader is unavailable: $($health.reason)" }

Write-Host "Dungeon local authority ready: $($health.model)"
Write-Host "Course retrieval: $($health.embeddingModel)"
Write-Host "Course evidence: $($health.lectureCount) lectures"
Write-Host "Private model path: $modelBaseUrl"
if ($HealthOnly) { return }

Set-Location $projectRoot
Write-Host "Opening Dungeon at http://127.0.0.1:$AppPort/"
& python (Join-Path $PSScriptRoot "server.py") $AppPort
