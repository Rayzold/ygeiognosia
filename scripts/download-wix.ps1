# Ygeiognosia - one-time download of the live Wix site:
# sitemaps, HTML of every URL, images (original resolution), PDFs, videos, uploaded fonts, screenshots.
# Run from the Ygeiognosia folder:
#   powershell -ExecutionPolicy Bypass -File .\scripts\download-wix.ps1
# Options: -SkipMedia  -SkipScreenshots
# Safe to re-run: files that already exist are skipped. Log: archive\download-log.txt
# (This file is ASCII only on purpose: Windows PowerShell 5.1 misreads UTF-8 scripts without BOM.)

param([switch]$SkipMedia, [switch]$SkipScreenshots)

$ErrorActionPreference = 'Continue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ProgressPreference = 'SilentlyContinue'

$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root 'CLAUDE.md'))) { $root = (Get-Location).Path }
$base = 'https://www.ygeiognosia.com'
$ua   = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
$uaMobile = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
$utf8 = New-Object System.Text.UTF8Encoding($false)

$arch = Join-Path $root 'archive'
$D = @{}
foreach ($k in @('sitemaps', 'html', 'media', 'files', 'video', 'fonts', 'screenshots')) {
  $D[$k] = Join-Path $arch $k
  New-Item -ItemType Directory -Force -Path $D[$k] | Out-Null
}
$log = Join-Path $arch 'download-log.txt'
[IO.File]::AppendAllText($log, "`r`n==== run $(Get-Date -Format s) ====`r`n", $utf8)

function Log($msg, $color = 'Gray') {
  Write-Host $msg -ForegroundColor $color
  [IO.File]::AppendAllText($log, "$msg`r`n", $utf8)
}

# returns 'skip' (already there), 'ok' or 'fail'
function Get-File($url, $out, $agent = $ua) {
  if ((Test-Path $out) -and ((Get-Item $out).Length -gt 0)) { return 'skip' }
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -UserAgent $agent -UseBasicParsing -TimeoutSec 120
    return 'ok'
  } catch {
    if (Test-Path $out) { Remove-Item $out -Force }
    [IO.File]::AppendAllText($log, "  error $url : $($_.Exception.Message)`r`n", $utf8)
    return 'fail'
  }
}

function Read-Text($path) { return [IO.File]::ReadAllText($path, [Text.Encoding]::UTF8) }

function Safe-Name($s, $max = 90) {
  $s = $s -replace '[\\/:*?"<>|\s]', '_'
  if ($s.Length -gt $max) { $s = $s.Substring(0, $max) }
  return $s
}

# ---------------------------------------------------------------- 1. sitemaps
Log '== 1/6 Sitemaps ==' Cyan
$idxFile = Join-Path $D.sitemaps 'sitemap.xml'
Get-File "$base/sitemap.xml" $idxFile | Out-Null
foreach ($extra in @('robots.txt', 'blog-feed.xml')) {
  $r = Get-File "$base/$extra" (Join-Path $D.sitemaps $extra)
  Log "  $r  /$extra"
}
$smUrls = @()
[xml]$idx = Read-Text $idxFile
if ($idx.sitemapindex) { $smUrls = @($idx.sitemapindex.sitemap | ForEach-Object { $_.loc }) }
$urls = New-Object System.Collections.Generic.List[object]
$seen = @{}
function Add-Url($u, $from) {
  $u = $u.Trim()
  if ($seen.ContainsKey($u)) { return }
  $seen[$u] = $true
  $urls.Add([pscustomobject]@{ url = $u; sitemap = $from })
}
if ($idx.urlset) { $idx.urlset.url | ForEach-Object { Add-Url $_.loc 'sitemap.xml' } }
foreach ($sm in $smUrls) {
  $name = Safe-Name (([Uri]$sm).PathAndQuery.TrimStart('/'))
  $out = Join-Path $D.sitemaps $name
  $r = Get-File $sm $out
  Log "  $r  $name"
  if (Test-Path $out) {
    [xml]$x = Read-Text $out
    if ($x.urlset) { $x.urlset.url | ForEach-Object { Add-Url $_.loc $name } }
  }
}
Add-Url "$base/" 'added'
Add-Url "$base/blog" 'added'
Log "  $($urls.Count) URLs in sitemaps" Green

# ---------------------------------------------------------------- 2. HTML
Log '== 2/6 HTML of every URL ==' Cyan
$used = @{}
$manifest = New-Object System.Collections.Generic.List[object]
$n = 0; $fails = 0
foreach ($e in $urls) {
  $n++
  $uri = [Uri]$e.url
  $path = [Uri]::UnescapeDataString($uri.AbsolutePath).Trim('/')
  $parts = @()
  if ($path -ne '') { $parts = $path.Split('/') }
  if ($parts.Count -eq 0) { $type = 'pages'; $name = 'home' }
  elseif ($parts.Count -ge 2 -and ($parts[0] -eq 'product-page' -or $parts[0] -eq 'post')) {
    $type = $parts[0]; $name = ($parts[1..($parts.Count - 1)] -join '__')
  }
  elseif ($parts[0] -eq 'blog') { $type = 'blog'; $name = ($parts -join '__') }
  else { $type = 'pages'; $name = ($parts -join '__') }
  $name = Safe-Name $name
  $key = "$type/$name"
  if ($used.ContainsKey($key)) { $name = "$name-$n"; $key = "$type/$name" }
  $used[$key] = $true
  $dir = Join-Path $D.html $type
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $out = Join-Path $dir "$name.html"
  $r = Get-File $uri.AbsoluteUri $out
  if ($r -eq 'fail') { $fails++; Log "  FAIL [$n/$($urls.Count)] /$path" Red }
  elseif ($r -eq 'ok') { Log "  ok   [$n/$($urls.Count)] /$path"; Start-Sleep -Milliseconds 700 }
  $manifest.Add([pscustomobject]@{ url = $e.url; path = "/$path"; type = $type; file = "html/$type/$name.html"; sitemap = $e.sitemap; status = $r })
}
[IO.File]::WriteAllText((Join-Path $arch 'urls.json'), ($manifest | ConvertTo-Json -Depth 3), $utf8)
Log "  HTML done, $fails failed" Green

# collect all text we have (HTML + sitemaps + feed) for asset discovery
$sb = New-Object System.Text.StringBuilder
Get-ChildItem $D.html -Recurse -Filter *.html | ForEach-Object { [void]$sb.Append((Read-Text $_.FullName)) }
Get-ChildItem $D.sitemaps -File | ForEach-Object { [void]$sb.Append((Read-Text $_.FullName)) }
$all = $sb.ToString()

if (-not $SkipMedia) {
  # -------------------------------------------------------------- 3. images
  Log '== 3/6 Images (original resolution) ==' Cyan
  $ids = @()
  $ids += [regex]::Matches($all, '[0-9a-f]{6}_[0-9a-f]{32}(?:f000|~mv2(?:_d_\d+_\d+_s_\d+)?)?\.(?:png|jpe?g|gif|webp|svg|avif)', 'IgnoreCase') | ForEach-Object { $_.Value }
  $ids += [regex]::Matches($all, 'nsplsh_[0-9A-Za-z]+~mv2(?:_d_\d+_\d+_s_\d+)?\.(?:png|jpe?g|webp)', 'IgnoreCase') | ForEach-Object { $_.Value }
  $ids = $ids | Sort-Object -Unique
  Log "  $($ids.Count) image ids found"
  $ok = 0; $skip = 0; $fail = @(); $i = 0
  foreach ($id in $ids) {
    $i++
    $r = Get-File "https://static.wixstatic.com/media/$id" (Join-Path $D.media ($id -replace '~', '_'))
    if ($r -eq 'ok') { $ok++ } elseif ($r -eq 'skip') { $skip++ } else { $fail += $id }
    if ($i % 50 -eq 0) { Write-Host "  ... $i / $($ids.Count)" }
  }
  Log "  $ok downloaded, $skip already there, $($fail.Count) failed" Green
  $fail | ForEach-Object { Log "  FAIL $_" Yellow }

  # -------------------------------------------------------------- 4. PDFs, videos, fonts
  Log '== 4/6 PDFs, videos, uploaded fonts ==' Cyan
  $pdfs = [regex]::Matches($all, '_files/ugd/[0-9a-zA-Z_]+\.pdf') | ForEach-Object { $_.Value } | Sort-Object -Unique
  foreach ($f in $pdfs) {
    $leaf = Split-Path $f -Leaf
    $r = Get-File "$base/$f" (Join-Path $D.files $leaf)
    Log "  $r  $leaf"
  }
  $vids = [regex]::Matches($all, 'video/([0-9a-f]{6}_[0-9a-f]{32})/') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
  foreach ($v in $vids) {
    $done = $false
    foreach ($q in @('1080p', '720p', '480p')) {
      $r = Get-File "https://video.wixstatic.com/video/$v/$q/mp4/file.mp4" (Join-Path $D.video "$v-$q.mp4")
      if ($r -ne 'fail') { Log "  $r  video $v ($q)"; $done = $true; break }
    }
    if (-not $done) { Log "  FAIL video $v" Red }
  }
  $fonts = [regex]::Matches($all, 'ufonts/([0-9a-f]{6}_[0-9a-f]{32})/(woff2|woff|ttf)/file\.(?:woff2|woff|ttf)') | ForEach-Object { $_.Value } | Sort-Object -Unique
  foreach ($f in $fonts) {
    $m = [regex]::Match($f, 'ufonts/([^/]+)/([^/]+)/')
    $leaf = $m.Groups[1].Value + '.' + $m.Groups[2].Value
    $r = Get-File "https://static.wixstatic.com/$f" (Join-Path $D.fonts $leaf)
    Log "  $r  font $leaf"
  }
  Log "  $($pdfs.Count) PDFs, $($vids.Count) videos, $($fonts.Count) font files" Green
}

if (-not $SkipScreenshots) {
  # -------------------------------------------------------------- 5. screenshots (Edge headless)
  Log '== 5/6 Screenshots (Microsoft Edge, headless) ==' Cyan
  $edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") |
          Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $edge) { Log '  Edge not found, screenshots skipped' Yellow }
  else {
    $prof = Join-Path $env:TEMP 'ygeiognosia-edge-profile'
    # every content page + blog, plus the first 3 products and the first 3 posts as template samples
    $pick = @($manifest | Where-Object { $_.type -eq 'pages' -or $_.type -eq 'blog' })
    $pick += @($manifest | Where-Object { $_.type -eq 'product-page' } | Select-Object -First 3)
    $pick += @($manifest | Where-Object { $_.type -eq 'post' } | Select-Object -First 3)
    $j = 0
    foreach ($p in $pick) {
      $j++
      $stem = Safe-Name ($p.file -replace '^html/', '' -replace '\.html$', '' -replace '/', '--') 100
      foreach ($vp in @(@{ tag = 'desktop'; w = 1440; h = 7000; agent = $ua }, @{ tag = 'mobile'; w = 390; h = 9000; agent = $uaMobile })) {
        $out = Join-Path $D.screenshots "$stem-$($vp.tag).png"
        if (Test-Path $out) { continue }
        $a = @('--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--mute-audio',
               "--user-data-dir=`"$prof`"", "--window-size=$($vp.w),$($vp.h)", '--virtual-time-budget=12000',
               "--user-agent=`"$($vp.agent)`"", "--screenshot=`"$out`"", ([Uri]$p.url).AbsoluteUri)
        $proc = Start-Process -FilePath $edge -ArgumentList $a -PassThru -WindowStyle Hidden
        if (-not $proc.WaitForExit(90000)) { try { $proc.Kill() } catch {} }
        if (Test-Path $out) { Log "  ok   [$j/$($pick.Count)] $stem ($($vp.tag))" } else { Log "  FAIL [$j/$($pick.Count)] $stem ($($vp.tag))" Yellow }
      }
    }
  }
}

# ---------------------------------------------------------------- 6. summary
Log '== 6/6 Summary ==' Cyan
foreach ($k in @('html', 'media', 'files', 'video', 'fonts', 'screenshots')) {
  $items = Get-ChildItem $D[$k] -Recurse -File -ErrorAction SilentlyContinue
  $mb = [math]::Round((($items | Measure-Object Length -Sum).Sum) / 1MB, 1)
  Log ("  {0,-12} {1,5} files  {2,8} MB" -f $k, $items.Count, $mb)
}
Log ''
Log 'Done. Tell Claude it finished.' Green
