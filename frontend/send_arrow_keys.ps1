Add-Type -AssemblyName System.Windows.Forms

function Variation1 {
    param (
        [int]$intervalMin = 1,
        [int]$intervalMax = 7,
        [int]$countMin = 1,
        [int]$countMax = 5
    )
    # Random down, up, right sequence at custom intervals
    while ($true) {
        # Generate random interval
        $interval = Get-Random -Minimum $intervalMin -Maximum ($intervalMax + 1)
        Start-Sleep -Seconds $interval
        
        # Send random number of down keys
        $downCount = Get-Random -Minimum $countMin -Maximum ($countMax + 1)
        for ($i = 0; $i -lt $downCount; $i++) {
            [System.Windows.Forms.SendKeys]::SendWait("{DOWN}")
        }
        
        # Send random number of up keys
        $upCount = Get-Random -Minimum $countMin -Maximum ($countMax + 1)
        for ($i = 0; $i -lt $upCount; $i++) {
            [System.Windows.Forms.SendKeys]::SendWait("{UP}")
        }
        
        # Send one right key
        [System.Windows.Forms.SendKeys]::SendWait("{RIGHT}")
    }
}

function Variation2 {
    param (
        [int]$sendDuration = 60,
        [int]$sendIntervalMs = 1000,
        [int]$waitMin = 30,
        [int]$waitMax = 180
    )
    # Send right keys continuously for custom duration at custom interval, then wait custom range, repeat
    while ($true) {
        # Send right keys for sendDuration seconds
        $totalMs = $sendDuration * 1000
        $sendCount = [math]::Floor($totalMs / $sendIntervalMs)
        if ($sendCount -le 0) { $sendCount = 1 }
        for ($i = 0; $i -lt $sendCount; $i++) {
            [System.Windows.Forms.SendKeys]::SendWait("{RIGHT}")
            Start-Sleep -Milliseconds $sendIntervalMs
        }
        
        # Wait random interval
        $waitInterval = Get-Random -Minimum $waitMin -Maximum ($waitMax + 1)
        Start-Sleep -Seconds $waitInterval
    }
}

# Menu to choose variation
Write-Host "Choose a variation:"
Write-Host "1 - Random down/up/right sequence"
Write-Host "2 - Continuous right keys with wait"
$choice = Read-Host "Enter your choice (1 or 2)"

switch ($choice) {
    '1' {
        Write-Host "Customize Variation 1:"
        $intervalMin = Read-Host "Interval min seconds (default 1)"
        if (-not $intervalMin) { $intervalMin = 1 }
        $intervalMax = Read-Host "Interval max seconds (default 7)"
        if (-not $intervalMax) { $intervalMax = 7 }
        $countMin = Read-Host "Count min (default 1)"
        if (-not $countMin) { $countMin = 1 }
        $countMax = Read-Host "Count max (default 5)"
        if (-not $countMax) { $countMax = 5 }
        
        # Validation
        try {
            $intervalMin = [int]$intervalMin
            $intervalMax = [int]$intervalMax
            $countMin = [int]$countMin
            $countMax = [int]$countMax
        } catch {
            Write-Host "Invalid input. Using defaults."
            $intervalMin = 1; $intervalMax = 7; $countMin = 1; $countMax = 5
        }
        if ($intervalMin -le 0) { $intervalMin = 1 }
        if ($intervalMax -le $intervalMin) { $intervalMax = $intervalMin + 1 }
        if ($countMin -le 0) { $countMin = 1 }
        if ($countMax -le $countMin) { $countMax = $countMin + 1 }
        
        Variation1 -intervalMin $intervalMin -intervalMax $intervalMax -countMin $countMin -countMax $countMax
    }
    '2' {
        Write-Host "Customize Variation 2:"
        $sendDuration = Read-Host "Send duration seconds (default 60)"
        if (-not $sendDuration) { $sendDuration = 60 }
        $intervalInput = Read-Host "Send interval (default 1s, e.g., 500ms or 1000us)"
        if (-not $intervalInput) { $intervalInput = "1s" }
        $waitMin = Read-Host "Wait min seconds (default 30)"
        if (-not $waitMin) { $waitMin = 30 }
        $waitMax = Read-Host "Wait max seconds (default 180)"
        if (-not $waitMax) { $waitMax = 180 }
        
        # Parse interval
        $intervalValue = 0
        $unit = ""
        if ($intervalInput -match '^(\d+)(s|ms|us)$') {
            $intervalValue = [int]$matches[1]
            $unit = $matches[2]
        } else {
            # Assume seconds if no unit
            $intervalValue = [int]$intervalInput
            $unit = "s"
        }
        
        # Convert to milliseconds
        switch ($unit) {
            "s" { $sendIntervalMs = $intervalValue * 1000 }
            "ms" { $sendIntervalMs = $intervalValue }
            "us" { $sendIntervalMs = [math]::Ceiling($intervalValue / 1000.0) }
            default { $sendIntervalMs = 1000 }
        }
        
        # Validation
        try {
            $sendDuration = [int]$sendDuration
            $waitMin = [int]$waitMin
            $waitMax = [int]$waitMax
        } catch {
            Write-Host "Invalid input. Using defaults."
            $sendDuration = 60; $sendIntervalMs = 1000; $waitMin = 30; $waitMax = 180
        }
        if ($sendDuration -le 0) { $sendDuration = 60 }
        if ($sendIntervalMs -le 0) { $sendIntervalMs = 1000 }
        if ($waitMin -lt 0) { $waitMin = 0 }
        if ($waitMax -le $waitMin) { $waitMax = $waitMin + 30 }
        
        Variation2 -sendDuration $sendDuration -sendIntervalMs $sendIntervalMs -waitMin $waitMin -waitMax $waitMax
    }
    default { Write-Host "Invalid choice. Exiting." }
}