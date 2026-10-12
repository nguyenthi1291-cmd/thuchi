# Pure ASCII PowerShell script to generate valid OpenXML .xlsx files with UTF8 data
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Make-ExcelFile {
    param(
        [string]$OutFile,
        [string]$SheetTitle,
        [string[]]$Cols,
        [array]$DataRows,
        [int[]]$Widths
    )

    $temp = Join-Path ([System.IO.Path]::GetTempPath()) ("xl_" + [System.Guid]::NewGuid().ToString("N"))
    $null = New-Item -ItemType Directory -Path (Join-Path $temp "_rels") -Force
    $null = New-Item -ItemType Directory -Path (Join-Path $temp "xl\_rels") -Force
    $null = New-Item -ItemType Directory -Path (Join-Path $temp "xl\worksheets") -Force

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)

    # 1. [Content_Types].xml
    $ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "`n" +
'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' + "`n" +
'  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' + "`n" +
'  <Default Extension="xml" ContentType="application/xml"/>' + "`n" +
'  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' + "`n" +
'  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' + "`n" +
'  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + "`n" +
'  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>' + "`n" +
'</Types>'
    [System.IO.File]::WriteAllText((Join-Path $temp "[Content_Types].xml"), $ct, $utf8NoBom)

    # 2. _rels/.rels
    $r1 = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "`n" +
'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + "`n" +
'  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' + "`n" +
'</Relationships>'
    [System.IO.File]::WriteAllText((Join-Path $temp "_rels\.rels"), $r1, $utf8NoBom)

    # 3. xl/_rels/workbook.xml.rels
    $r2 = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "`n" +
'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + "`n" +
'  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' + "`n" +
'  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' + "`n" +
'  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>' + "`n" +
'</Relationships>'
    [System.IO.File]::WriteAllText((Join-Path $temp "xl\_rels\workbook.xml.rels"), $r2, $utf8NoBom)

    # 4. xl/workbook.xml
    $wb = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "`n" +
'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' + "`n" +
'  <sheets>' + "`n" +
"    <sheet name=""$SheetTitle"" sheetId=""1"" r:id=""rId1""/>" + "`n" +
'  </sheets>' + "`n" +
'</workbook>'
    [System.IO.File]::WriteAllText((Join-Path $temp "xl\workbook.xml"), $wb, $utf8NoBom)

    # 5. xl/styles.xml
    $st = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "`n" +
'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' + "`n" +
'  <fonts count="2">' + "`n" +
'    <font><sz val="11"/><name val="Segoe UI"/><color rgb="FF0F172A"/></font>' + "`n" +
'    <font><b/><sz val="11"/><name val="Segoe UI"/><color rgb="FFFFFFFF"/></font>' + "`n" +
'  </fonts>' + "`n" +
'  <fills count="3">' + "`n" +
'    <fill><patternFill patternType="none"/></fill>' + "`n" +
'    <fill><patternFill patternType="gray125"/></fill>' + "`n" +
'    <fill><patternFill patternType="solid"><fgColor rgb="FF1E40AF"/></patternFill></fill>' + "`n" +
'  </fills>' + "`n" +
'  <borders count="2">' + "`n" +
'    <border><left/><right/><top/><bottom/></border>' + "`n" +
'    <border>' + "`n" +
'      <left style="thin"><color rgb="FFE2E8F0"/></left>' + "`n" +
'      <right style="thin"><color rgb="FFE2E8F0"/></right>' + "`n" +
'      <top style="thin"><color rgb="FFE2E8F0"/></top>' + "`n" +
'      <bottom style="thin"><color rgb="FFE2E8F0"/></bottom>' + "`n" +
'    </border>' + "`n" +
'  </borders>' + "`n" +
'  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' + "`n" +
'  <cellXfs count="3">' + "`n" +
'    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"/>' + "`n" +
'    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1">' + "`n" +
'      <alignment horizontal="center" vertical="center" wrapText="1"/>' + "`n" +
'    </xf>' + "`n" +
'    <xf numFmtId="3" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1">' + "`n" +
'      <alignment horizontal="right"/>' + "`n" +
'    </xf>' + "`n" +
'  </cellXfs>' + "`n" +
'</styleSheet>'
    [System.IO.File]::WriteAllText((Join-Path $temp "xl\styles.xml"), $st, $utf8NoBom)

    # 6. Shared Strings Map
    $strList = New-Object System.Collections.Generic.List[string]
    $strLookup = @{}

    function Add-Str([string]$v) {
        if ($strLookup.ContainsKey($v)) {
            return $strLookup[$v]
        }
        $pos = $strList.Count
        $strList.Add($v)
        $strLookup[$v] = $pos
        return $pos
    }

    foreach ($c in $Cols) {
        $null = Add-Str $c
    }

    function ToCol([int]$num) {
        $dividend = $num
        $res = ""
        while ($dividend -gt 0) {
            $m = ($dividend - 1) % 26
            $res = [char](65 + $m) + $res
            $dividend = [math]::Floor(($dividend - $m) / 26)
        }
        return $res
    }

    # 7. Rows
    $sb = New-Object System.Text.StringBuilder
    $null = $sb.Append('<row r="1" ht="28" customHeight="1">')
    for ($i = 0; $i -lt $Cols.Count; $i++) {
        $ref = (ToCol ($i + 1)) + "1"
        $idx = Add-Str $Cols[$i]
        $null = $sb.Append("<c r=""$ref"" t=""s"" s=""1""><v>$idx</v></c>")
    }
    $null = $sb.Append('</row>')

    for ($r = 0; $r -lt $DataRows.Count; $r++) {
        $rowId = $r + 2
        $rowArr = $DataRows[$r]
        $null = $sb.Append("<row r=""$rowId"" ht=""20"" customHeight=""1"">")

        for ($i = 0; $i -lt $Cols.Count; $i++) {
            $ref = (ToCol ($i + 1)) + "$rowId"
            $val = if ($i -lt $rowArr.Count) { $rowArr[$i] } else { "" }

            $isNumber = $false
            $numVal = 0
            if ($val -ne $null -and "$val" -ne "") {
                $sv = "$val"
                if ([double]::TryParse($sv, [ref]$numVal) -and -not ($sv -match '^\d{4}-\d{2}-\d{2}$') -and -not ($sv.StartsWith('0') -and $sv.Length -gt 1 -and -not $sv.Contains('.'))) {
                    $isNumber = $true
                }
            }

            if ($isNumber) {
                $null = $sb.Append("<c r=""$ref"" s=""2""><v>$numVal</v></c>")
            } elseif ($val -ne $null -and "$val" -ne "") {
                $idx = Add-Str "$val"
                $null = $sb.Append("<c r=""$ref"" t=""s"" s=""0""><v>$idx</v></c>")
            } else {
                $null = $sb.Append("<c r=""$ref"" s=""0""/>")
            }
        }
        $null = $sb.Append('</row>')
    }

    $colsXml = ""
    if ($Widths -and $Widths.Count -gt 0) {
        $cw = New-Object System.Text.StringBuilder
        $null = $cw.Append("<cols>")
        for ($i = 0; $i -lt $Widths.Count; $i++) {
            $colNum = $i + 1
            $w = $Widths[$i]
            $null = $cw.Append("<col min=""$colNum"" max=""$colNum"" width=""$w"" customWidth=""1""/>")
        }
        $null = $cw.Append("</cols>")
        $colsXml = $cw.ToString()
    }

    $wsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "`n" +
'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' + "`n" +
"  $colsXml`n" +
'  <sheetData>' + "`n" +
"    $($sb.ToString())`n" +
'  </sheetData>' + "`n" +
'</worksheet>'
    [System.IO.File]::WriteAllText((Join-Path $temp "xl\worksheets\sheet1.xml"), $wsXml, $utf8NoBom)

    # 8. sharedStrings.xml
    $ss = New-Object System.Text.StringBuilder
    $null = $ss.Append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + "`n" + "<sst xmlns=""http://schemas.openxmlformats.org/spreadsheetml/2006/main"" count=""$($strList.Count)"" uniqueCount=""$($strList.Count)"">`n")
    foreach ($entry in $strList) {
        $esc = [System.Security.SecurityElement]::Escape($entry)
        $null = $ss.Append("  <si><t>$esc</t></si>`n")
    }
    $null = $ss.Append("</sst>")
    [System.IO.File]::WriteAllText((Join-Path $temp "xl\sharedStrings.xml"), $ss.ToString(), $utf8NoBom)

    # 9. Zip into .xlsx
    if (Test-Path $OutFile) {
        Remove-Item $OutFile -Force
    }
    [System.IO.Compression.ZipFile]::CreateFromDirectory($temp, $OutFile)
    Remove-Item $temp -Recurse -Force
    Write-Host "Success: $OutFile"
}

# --- 1. Sổ Thu Chi Chung ---
$c1 = @("Ngay_Giao_Dich", "Ma_Mang_Hoat_Dong", "Loai_Giao_Dich", "Danh_Muc", "So_Tien", "Hinh_Thuc_Thanh_Toan", "Dien_Giai", "Ma_Chung_Tu")
$d1 = @(
    @("2026-10-12", "FNB", "Thu", "Doanh thu ca ngay", 4500000, "Chuyen_Khoan", "Thu tien ban hang ca sang va chieu", "HD-001"),
    @("2026-10-12", "FNB", "Chi", "Mua nguyen vat lieu", 1250000, "Tien_Mat", "Mua rau cu thit bo tai cho dau moi", "HD-002"),
    @("2026-10-12", "SON_MAI", "Thu", "Ban thanh pham", 8900000, "Chuyen_Khoan", "Khach hang chuyen tien mua bo am chen son mai", "SM-881"),
    @("2026-10-12", "SON_MAI", "Chi", "Mua voc moc va dung cu", 2100000, "Chuyen_Khoan", "Thanh toan xuong moc nhap voc chen dia", "SM-882"),
    @("2026-10-12", "VAN_PHONG", "Chi", "Tien dien nuoc Internet", 850000, "Chuyen_Khoan", "Thanh toan tien dien van phong thang 10", "VP-102")
)
$w1 = @(16, 20, 16, 26, 18, 22, 42, 18)
Make-ExcelFile -OutFile "d:\Quanlythuchi\templates\mau_so_thu_chi_chung.xlsx" -SheetTitle "SoThuChi" -Cols $c1 -DataRows $d1 -Widths $w1

# --- 2. Đối soát F&B ---
$c2 = @("Ngay_Doi_Soat", "Doanh_Thu_KiotViet", "Tien_Mat_Thuc_Thu", "Chuyen_Khoan_MB", "Ly_Do_Chenh_Lech", "Ghi_Chu")
$d2 = @(
    @("2026-10-10", 8500000, 3200000, 5300000, "Khop 100% doanh thu KiotViet", "Ca lam viec nhan vien Lan"),
    @("2026-10-11", 10200000, 4100000, 6000000, "Khach ban 5 thieu 100000 hen thanh toan mai", "Thu ngan Hung"),
    @("2026-10-12", 7600000, 2800000, 4850000, "Khach tip them 50000 chuyen vao tai khoan MB", "Khop du")
)
$w2 = @(16, 22, 20, 20, 48, 28)
Make-ExcelFile -OutFile "d:\Quanlythuchi\templates\mau_doi_soat_fnb.xlsx" -SheetTitle "DoiSoatFNB" -Cols $c2 -DataRows $d2 -Widths $w2

# --- 3. Chi Lương & Chuyển Khoản ---
$c3 = @("Ngay_Chi", "Ma_Mang_Hoat_Dong", "Phan_Loai_Chi", "Khoan_Muc_Chi", "Nguoi_Nhan", "So_Tien", "Ngan_Hang_Nhan", "So_Tai_Khoan_Nhan", "Ma_UNC_Giao_Dich", "Tai_Khoan_Trich_Chi", "Dien_Giai", "Ghi_Chu")
$d3 = @(
    @("2026-10-12", "FNB", "Luong", "Luong cung / Luong thang", "Nguyen Van Tuan (Bep truong)", 12000000, "MB Bank", "0988776655", "FT26101201", "MB Bank", "Chi luong bep truong thang 10", "Duyet chi GD"),
    @("2026-10-12", "FNB", "Chuyen_Khoan", "Thanh toan NCC / Tien hang", "Cong ty CP Thuc Pham Xanh", 6500000, "Vietcombank", "0011004455667", "FT26101202", "MB Bank", "Thanh toan tien thit bo ca hoi", "Hoa don VAT so 0029"),
    @("2026-10-12", "SON_MAI", "Luong", "Luong ca / Part-time", "Tran Thi Mai (Nghe nhan phu)", 5500000, "Techcombank", "19034567891011", "FT26101203", "MB Bank", "Chi luong cong nhat tao phoi son mai", "22 cong"),
    @("2026-10-12", "SON_MAI", "Chuyen_Khoan", "Chi phi van hanh va Dung cu", "Xuong Moc Binh An", 4200000, "MB Bank", "0345987123", "FT26101204", "MB Bank", "Mua voc moc hop trang suc va khay tra", "Uy nhiem chi so 12"),
    @("2026-10-12", "VAN_PHONG", "Chuyen_Khoan", "Thue mat bang Dien nuoc Net", "BQL Toa Nha Van Phuc", 15000000, "BIDV", "12410000889988", "FT26101205", "MB Bank", "Tien thue mat bang van phong thang 10", "Co hop dong thue")
)
$w3 = @(16, 20, 16, 28, 28, 18, 18, 22, 20, 20, 42, 25)
Make-ExcelFile -OutFile "d:\Quanlythuchi\templates\mau_chi_luong_chuyen_khoan.xlsx" -SheetTitle "ChiLuongChuyenKhoan" -Cols $c3 -DataRows $d3 -Widths $w3
