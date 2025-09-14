@echo off
chcp 65001 >nul
title 51Talk员工数字名片平台

echo 🚀 启动51Talk员工数字名片平台...
echo.

:: 检查Node.js
echo 📋 检查环境...
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未安装Node.js，请先安装Node.js 18或更高版本
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('node -v') do set node_version=%%a
echo Node.js版本: %node_version%

for /f "tokens=*" %%a in ('npm -v') do set npm_version=%%a
echo npm版本: %npm_version%
echo.

:: 检查环境变量文件
if not exist ".env.local" (
    echo ⚠️  警告: 未找到.env.local文件
    echo 📝 请复制env.example为.env.local并配置环境变量
    echo.
    
    if exist "env.example" (
        echo 💡 是否现在创建.env.local文件? ^(y/n^)
        set /p response=
        if /i "%response%"=="y" (
            copy env.example .env.local >nul
            echo ✅ 已创建.env.local文件，请编辑配置
            echo 📝 请配置以下环境变量:
            echo    - NEXT_PUBLIC_SUPABASE_URL
            echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
            echo    - SUPABASE_SERVICE_ROLE_KEY
            echo    - REMOVE_BG_API_KEY
            echo    - JWT_SECRET
            echo.
            echo 📝 请编辑.env.local文件后重新运行此脚本
            pause
            exit /b 1
        )
    )
)

:: 检查依赖
if not exist "node_modules" (
    echo 📦 安装依赖包...
    call npm install
    
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
    echo.
) else (
    echo ✅ 依赖已存在
    echo.
)

:: 检查TypeScript编译
echo 🔍 检查TypeScript...
call npm run type-check >nul 2>&1
if errorlevel 1 (
    echo ⚠️  TypeScript检查发现问题，但将继续启动...
) else (
    echo ✅ TypeScript检查通过
)
echo.

:: 启动开发服务器
echo 🌐 启动开发服务器...
echo 📍 应用将在 http://localhost:3000 启动
echo ⏹️  按 Ctrl+C 停止服务器
echo.

call npm run dev
