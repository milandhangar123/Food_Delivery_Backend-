# PowerShell script to stop the server running on port 9000
Write-Host "Looking for processes on port 9000..."

$connections = Get-NetTCPConnection -LocalPort 9000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }

if ($connections) {
    $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -ne 0 }
    
    if ($processIds) {
        foreach ($pid in $processIds) {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Stopping process: $($process.ProcessName) (PID: $pid)..."
                Stop-Process -Id $pid -Force
                Write-Host "✅ Stopped!"
            }
        }
    } else {
        Write-Host "⚠️  No processes found to stop (only system processes)"
    }
} else {
    Write-Host "✅ Port 9000 is already free!"
}

Write-Host "`nPort 9000 status:"
Start-Sleep -Seconds 1
$check = Get-NetTCPConnection -LocalPort 9000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
if ($check) {
    Write-Host "⚠️  Port 9000 is still in use"
} else {
    Write-Host "✅ Port 9000 is free and ready to use!"
}

