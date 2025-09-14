#!/bin/bash

# 51Talk员工数字名片平台启动脚本

echo "🚀 启动51Talk员工数字名片平台..."

# 检查Node.js版本
echo "📋 检查环境..."
node_version=$(node -v)
echo "Node.js版本: $node_version"

if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装Node.js，请先安装Node.js 18或更高版本"
    exit 1
fi

# 检查npm版本
npm_version=$(npm -v)
echo "npm版本: $npm_version"

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    echo "⚠️  警告: 未找到.env.local文件"
    echo "📝 请复制env.example为.env.local并配置环境变量"
    
    if [ -f "env.example" ]; then
        echo "💡 是否现在创建.env.local文件? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            cp env.example .env.local
            echo "✅ 已创建.env.local文件，请编辑配置"
            echo "📝 请配置以下环境变量:"
            echo "   - NEXT_PUBLIC_SUPABASE_URL"
            echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
            echo "   - SUPABASE_SERVICE_ROLE_KEY"
            echo "   - REMOVE_BG_API_KEY"
            echo "   - JWT_SECRET"
            exit 1
        fi
    fi
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已存在"
fi

# 检查TypeScript编译
echo "🔍 检查TypeScript..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript检查发现问题，但将继续启动..."
fi

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "📍 应用将在 http://localhost:3000 启动"
echo "⏹️  按 Ctrl+C 停止服务器"
echo ""

npm run dev
