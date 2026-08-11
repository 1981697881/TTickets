param(
    [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\static\tabbar')
)

Add-Type -AssemblyName System.Drawing

$iconSize = 100
$idleColor = [System.Drawing.ColorTranslator]::FromHtml('#737873')
$activeColor = [System.Drawing.ColorTranslator]::FromHtml('#A9B238')

function New-IconCanvas {
    $bitmap = [System.Drawing.Bitmap]::new($iconSize, $iconSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    return [PSCustomObject]@{ Bitmap = $bitmap; Graphics = $graphics }
}

function New-RoundPen([System.Drawing.Color]$Color, [single]$Width = 5.5) {
    $pen = [System.Drawing.Pen]::new($Color, $Width)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    return $pen
}

function Clear-Ellipse($Graphics, [single]$X, [single]$Y, [single]$Width, [single]$Height) {
    $oldMode = $Graphics.CompositingMode
    $Graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $transparent = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::Transparent)
    $Graphics.FillEllipse($transparent, $X, $Y, $Width, $Height)
    $transparent.Dispose()
    $Graphics.CompositingMode = $oldMode
}

function Clear-Path($Graphics, $Path) {
    $oldMode = $Graphics.CompositingMode
    $Graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $transparent = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::Transparent)
    $Graphics.FillPath($transparent, $Path)
    $transparent.Dispose()
    $Graphics.CompositingMode = $oldMode
}

function New-SparklePath([single]$CenterX, [single]$CenterY, [single]$OuterRadius = 9, [single]$InnerRadius = 3.5) {
    $points = [System.Collections.Generic.List[System.Drawing.PointF]]::new()
    for ($index = 0; $index -lt 8; $index++) {
        $angle = ((-90 + ($index * 45)) * [Math]::PI) / 180
        $radius = if (($index % 2) -eq 0) { $OuterRadius } else { $InnerRadius }
        $points.Add([System.Drawing.PointF]::new(
            [single]($CenterX + ([Math]::Cos($angle) * $radius)),
            [single]($CenterY + ([Math]::Sin($angle) * $radius))
        ))
    }
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $path.AddPolygon($points.ToArray())
    return $path
}

function Add-CubicBezier($Path, [single]$Control1X, [single]$Control1Y, [single]$Control2X, [single]$Control2Y, [single]$EndX, [single]$EndY) {
    $start = $Path.GetLastPoint()
    $Path.AddBezier($start.X, $start.Y, $Control1X, $Control1Y, $Control2X, $Control2Y, $EndX, $EndY)
}

function Add-StraightLine($Path, [single]$EndX, [single]$EndY) {
    $start = $Path.GetLastPoint()
    $Path.AddLine($start.X, $start.Y, $EndX, $EndY)
}

function Save-Icon($Canvas, [string]$Name) {
    $path = Join-Path $OutputDirectory $Name
    $Canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $Canvas.Graphics.Dispose()
    $Canvas.Bitmap.Dispose()
}

function Draw-MovieIcon([bool]$Active) {
    $canvas = New-IconCanvas
    $color = if ($Active) { $activeColor } else { $idleColor }
    $pen = New-RoundPen $color
    $brush = [System.Drawing.SolidBrush]::new($color)

    if ($Active) {
        $canvas.Graphics.FillEllipse($brush, 24, 20, 52, 52)
        foreach ($hole in @(@(45, 27, 10), @(32, 42, 10), @(58, 42, 10), @(45, 55, 10))) {
            Clear-Ellipse $canvas.Graphics $hole[0] $hole[1] $hole[2] $hole[2]
        }
    } else {
        $canvas.Graphics.DrawEllipse($pen, 24, 20, 52, 52)
        foreach ($hole in @(@(45, 27, 10), @(32, 42, 10), @(58, 42, 10), @(45, 55, 10))) {
            $canvas.Graphics.FillEllipse($brush, $hole[0], $hole[1], $hole[2], $hole[2])
        }
    }
    $canvas.Graphics.DrawBezier($pen, 64, 64, 71, 64, 77, 68, 82, 72)

    $pen.Dispose()
    $brush.Dispose()
    Save-Icon $canvas $(if ($Active) { 'movie-active.png' } else { 'movie.png' })
}

function New-ShopBodyPath {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $path.StartFigure()
    $path.AddLine(25, 37, 75, 37)
    Add-CubicBezier $path 78 37 80 40 80 43
    Add-StraightLine $path 80 70
    Add-CubicBezier $path 80 76 77 79 71 79
    Add-StraightLine $path 29 79
    Add-CubicBezier $path 23 79 20 76 20 70
    Add-StraightLine $path 20 43
    Add-CubicBezier $path 20 40 22 37 25 37
    $path.CloseFigure()
    return $path
}

function Draw-ShopIcon([bool]$Active) {
    $canvas = New-IconCanvas
    $color = if ($Active) { $activeColor } else { $idleColor }
    $pen = New-RoundPen $color
    $brush = [System.Drawing.SolidBrush]::new($color)
    $body = New-ShopBodyPath
    $sparkle = New-SparklePath 50 57 8 3

    if ($Active) {
        $canvas.Graphics.FillPath($brush, $body)
        Clear-Path $canvas.Graphics $sparkle
    } else {
        $canvas.Graphics.DrawPath($pen, $body)
        $sparklePen = New-RoundPen $color 3.8
        $canvas.Graphics.DrawPath($sparklePen, $sparkle)
        $sparklePen.Dispose()
    }
    $canvas.Graphics.DrawArc($pen, 35, 20, 30, 34, 180, 180)

    $body.Dispose()
    $sparkle.Dispose()
    $pen.Dispose()
    $brush.Dispose()
    Save-Icon $canvas $(if ($Active) { 'shop-active.png' } else { 'shop.png' })
}

function New-TicketPath {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $path.StartFigure()
    $path.AddLine(27, 25, 73, 25)
    Add-CubicBezier $path 77 25 80 28 80 32
    Add-StraightLine $path 80 39
    Add-CubicBezier $path 69 39 69 53 80 53
    Add-StraightLine $path 80 68
    Add-CubicBezier $path 80 72 77 75 73 75
    Add-StraightLine $path 27 75
    Add-CubicBezier $path 23 75 20 72 20 68
    Add-StraightLine $path 20 53
    Add-CubicBezier $path 31 53 31 39 20 39
    Add-StraightLine $path 20 32
    Add-CubicBezier $path 20 28 23 25 27 25
    $path.CloseFigure()
    return $path
}

function Draw-ActivityIcon([bool]$Active) {
    $canvas = New-IconCanvas
    $color = if ($Active) { $activeColor } else { $idleColor }
    $pen = New-RoundPen $color
    $brush = [System.Drawing.SolidBrush]::new($color)
    $ticket = New-TicketPath
    $sparkle = New-SparklePath 53 50 12 5

    if ($Active) {
        $canvas.Graphics.FillPath($brush, $ticket)
        Clear-Path $canvas.Graphics $sparkle
    } else {
        $canvas.Graphics.DrawPath($pen, $ticket)
        $sparklePen = New-RoundPen $color 4
        $canvas.Graphics.DrawPath($sparklePen, $sparkle)
        $sparklePen.Dispose()
    }

    $ticket.Dispose()
    $sparkle.Dispose()
    $pen.Dispose()
    $brush.Dispose()
    Save-Icon $canvas $(if ($Active) { 'activity-active.png' } else { 'activity.png' })
}

function New-GamepadPath {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $path.StartFigure()
    $path.AddLine(31, 34, 31, 34)
    Add-CubicBezier $path 23 34 20 41 18 52
    Add-StraightLine $path 15 67
    Add-CubicBezier $path 13 77 26 84 34 74
    Add-StraightLine $path 40 67
    Add-CubicBezier $path 45 63 55 63 60 67
    Add-StraightLine $path 66 74
    Add-CubicBezier $path 74 84 87 77 85 67
    Add-StraightLine $path 82 52
    Add-CubicBezier $path 80 41 77 34 69 34
    $path.CloseFigure()
    return $path
}

function Draw-GameIcon([bool]$Active) {
    $canvas = New-IconCanvas
    $color = if ($Active) { $activeColor } else { $idleColor }
    $pen = New-RoundPen $color
    $brush = [System.Drawing.SolidBrush]::new($color)
    $gamepad = New-GamepadPath

    if ($Active) {
        $canvas.Graphics.FillPath($brush, $gamepad)
        $detailPen = New-RoundPen ([System.Drawing.Color]::Transparent) 5
        $oldMode = $canvas.Graphics.CompositingMode
        $canvas.Graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $canvas.Graphics.DrawLine($detailPen, 29, 48, 29, 60)
        $canvas.Graphics.DrawLine($detailPen, 23, 54, 35, 54)
        Clear-Ellipse $canvas.Graphics 62 47 7 7
        Clear-Ellipse $canvas.Graphics 70 56 7 7
        $canvas.Graphics.CompositingMode = $oldMode
        $detailPen.Dispose()
    } else {
        $canvas.Graphics.DrawPath($pen, $gamepad)
        $detailPen = New-RoundPen $color 5
        $canvas.Graphics.DrawLine($detailPen, 29, 48, 29, 60)
        $canvas.Graphics.DrawLine($detailPen, 23, 54, 35, 54)
        $canvas.Graphics.FillEllipse($brush, 62, 47, 7, 7)
        $canvas.Graphics.FillEllipse($brush, 70, 56, 7, 7)
        $detailPen.Dispose()
    }

    $gamepad.Dispose()
    $pen.Dispose()
    $brush.Dispose()
    Save-Icon $canvas $(if ($Active) { 'game-active.png' } else { 'game.png' })
}

function New-ProfileBodyPath {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $path.StartFigure()
    $path.AddLine(29, 78, 29, 78)
    Add-CubicBezier $path 29 62 37 55 50 55
    Add-CubicBezier $path 63 55 71 62 71 78
    Add-CubicBezier $path 71 80 69 81 67 81
    Add-StraightLine $path 33 81
    Add-CubicBezier $path 31 81 29 80 29 78
    $path.CloseFigure()
    return $path
}

function Draw-UserIcon([bool]$Active) {
    $canvas = New-IconCanvas
    $color = if ($Active) { $activeColor } else { $idleColor }
    $pen = New-RoundPen $color
    $brush = [System.Drawing.SolidBrush]::new($color)
    $body = New-ProfileBodyPath

    if ($Active) {
        $canvas.Graphics.FillEllipse($brush, 37, 18, 26, 26)
        $canvas.Graphics.FillPath($brush, $body)
    } else {
        $canvas.Graphics.DrawEllipse($pen, 37, 18, 26, 26)
        $canvas.Graphics.DrawPath($pen, $body)
    }

    $body.Dispose()
    $pen.Dispose()
    $brush.Dispose()
    Save-Icon $canvas $(if ($Active) { 'user-active.png' } else { 'user.png' })
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
Draw-MovieIcon $false
Draw-MovieIcon $true
Draw-ShopIcon $false
Draw-ShopIcon $true
Draw-ActivityIcon $false
Draw-ActivityIcon $true
Draw-GameIcon $false
Draw-GameIcon $true
Draw-UserIcon $false
Draw-UserIcon $true

Write-Output "Generated 10 TabBar icons in $([System.IO.Path]::GetFullPath($OutputDirectory))"
