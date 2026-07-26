param(
  [string]$OutputDirectory = (Join-Path $PSScriptRoot "..\assets\img\hikes")
)

$ErrorActionPreference = "Stop"

$albums = [ordered]@{
  "victoria-peak"  = "https://sites.google.com/view/haoran-liu/miscellaneous/victoria-peak?authuser=0"
  "lamma-island"   = "https://sites.google.com/view/haoran-liu/miscellaneous/lamma-island?authuser=0"
  "lai-chi-wo"     = "https://sites.google.com/view/haoran-liu/miscellaneous/lai-chi-wo?authuser=0"
  "lantau-trail"   = "https://sites.google.com/view/haoran-liu/miscellaneous/lan-tau-trail?authuser=0"
  "shek-o"         = "https://sites.google.com/view/haoran-liu/miscellaneous/shek-o?authuser=0"
  "sai-kung-north" = "https://sites.google.com/view/haoran-liu/miscellaneous/sai-kung-north?authuser=0"
  "pat-sin-leng"   = "https://sites.google.com/view/haoran-liu/miscellaneous/pat-sin-leng?authuser=0"
  "ma-on-shan"     = "https://sites.google.com/view/haoran-liu/miscellaneous/ma-on-shan?authuser=0"
  "tai-to-yan"     = "https://sites.google.com/view/haoran-liu/miscellaneous/tai-to-yan?authuser=0"
}

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
[System.IO.Directory]::CreateDirectory($resolvedOutput) | Out-Null

foreach ($album in $albums.GetEnumerator()) {
  $html = & curl.exe -sS -fL -A "Mozilla/5.0" $album.Value
  if ($LASTEXITCODE -ne 0) {
    throw "Could not download album page: $($album.Value)"
  }

  $seen = [System.Collections.Generic.HashSet[string]]::new(
    [System.StringComparer]::Ordinal
  )
  $imageUrls = [System.Collections.Generic.List[string]]::new()

  foreach ($match in [regex]::Matches(
    $html,
    "https://lh3\.googleusercontent\.com/sitesv/[A-Za-z0-9_-]+(?:=w\d+)?"
  )) {
    $baseUrl = [regex]::Replace($match.Value, "=w\d+$", "")
    if ($seen.Add($baseUrl)) {
      $imageUrls.Add("$baseUrl=w16383")
    }
  }

  if ($imageUrls.Count -eq 0) {
    throw "No album images found for $($album.Key)"
  }

  # Google Sites places the shared page banner before the album photographs.
  # It is the same 1350 x 500 PNG on every page and is not part of the gallery.
  $imageUrls.RemoveAt(0)

  Get-ChildItem -LiteralPath $resolvedOutput -Filter "$($album.Key)*.jpg" |
    Remove-Item -Force

  for ($index = 0; $index -lt $imageUrls.Count; $index++) {
    $suffix = if ($index -eq 0) { "" } else { "-{0:D2}" -f ($index + 1) }
    $target = Join-Path $resolvedOutput "$($album.Key)$suffix.jpg"

    & curl.exe -sS -fL --retry 3 -A "Mozilla/5.0" -o $target $imageUrls[$index]
    if ($LASTEXITCODE -ne 0) {
      throw "Could not download image $($index + 1) for $($album.Key)"
    }
  }

  Write-Output ("{0}: downloaded {1} photographs" -f $album.Key, $imageUrls.Count)
}

& python (Join-Path $PSScriptRoot "normalize-hike-images.py") $resolvedOutput
if ($LASTEXITCODE -ne 0) {
  throw "Could not normalize downloaded album images"
}
