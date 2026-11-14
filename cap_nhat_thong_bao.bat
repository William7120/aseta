@echo off
chcp 65001 >nul
echo ========================================================
echo    ĐỒNG BỘ THÔNG BÁO THPT TRẦN VĂN GIÀU VÀO ASETA
echo ========================================================
echo.
echo [1/3] Đang cào dữ liệu mới nhất từ thpttranvangiau.hcm.edu.vn...
node scripts/scrape_school_news.js
if %ERRORLEVEL% NEQ 0 (
    echo [LỖI] Không thể tải dữ liệu từ website trường!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Cập nhật và đẩy lên GitHub Pages...
git add data/school_news.json
git commit -m "chore: cap nhat thong bao lich tuan va ban tru TVG"
git push origin main

echo.
echo ========================================================
echo [3/3] HOÀN TẤT! Web Aseta đã có dữ liệu mới nhất.
echo Link: https://william7120.github.io/aseta/
echo ========================================================
echo.
pause
