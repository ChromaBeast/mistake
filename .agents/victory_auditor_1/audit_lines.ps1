$files = Get-ChildItem -Path backend, web, mobile, e2e -Recurse -Include *.go, *.ts, *.tsx, *.js, *.jsx, *.css, *.dart -File | Where-Object { 
    $_.FullName -notmatch '\\\.next\\' -and 
    $_.FullName -notmatch '\\node_modules\\' -and 
    $_.FullName -notmatch '\\\.dart_tool\\' -and 
    $_.FullName -notmatch '\\build\\' -and
    $_.FullName -notmatch '\.g\.dart$'
}

$violations = @()
$totalFiles = 0

foreach ($f in $files) {
    $totalFiles++
    $count = (Get-Content -LiteralPath $f.FullName).Count
    if ($count -ge 200) {
        $violations += [PSCustomObject]@{ File = $f.FullName; Lines = $count }
    }
}

Write-Output "Total source files scanned: $totalFiles"
Write-Output "Violations count: $($violations.Count)"

if ($violations.Count -gt 0) {
    $violations | Format-Table -AutoSize
} else {
    Write-Output "ALL SOURCE FILES ARE STRICTLY < 200 LoC! ZERO VIOLATIONS."
}
