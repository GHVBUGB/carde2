#!/bin/bash

# 51Talk数字名片平台 - 快速部署脚本
# 使用方法: ./deploy.sh [vercel|docker|server]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# 检查必要的工具
check_requirements() {
    print_header "检查部署环境"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js 版本过低，需要 18+，当前版本: $(node -v)"
        exit 1
    fi
    
    print_message "Node.js 版本: $(node -v)"
    print_message "npm 版本: $(npm -v)"
}

# 安装依赖
install_dependencies() {
    print_header "安装项目依赖"
    
    if [ ! -f "package.json" ]; then
        print_error "package.json 文件不存在，请确保在项目根目录运行此脚本"
        exit 1
    fi
    
    print_message "正在安装依赖..."
    npm install
    
    print_message "依赖安装完成"
}

# 构建项目
build_project() {
    print_header "构建项目"
    
    print_message "正在构建项目..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_message "项目构建成功"
    else
        print_error "项目构建失败"
        exit 1
    fi
}

# Vercel 部署
deploy_vercel() {
    print_header "Vercel 部署"
    
    if ! command -v vercel &> /dev/null; then
        print_message "安装 Vercel CLI..."
        npm install -g vercel
    fi
    
    # 检查环境变量文件
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production 文件不存在"
        print_message "请创建 .env.production 文件并配置环境变量"
        print_message "参考 env.production.example 文件"
        read -p "是否继续部署？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    print_message "开始部署到 Vercel..."
    vercel --prod
    
    print_message "Vercel 部署完成！"
    print_message "请在 Vercel 控制台中配置环境变量"
}

# Docker 部署
deploy_docker() {
    print_header "Docker 部署"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    # 检查环境变量文件
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production 文件不存在"
        print_message "请创建 .env.production 文件并配置环境变量"
        print_message "参考 env.production.example 文件"
        read -p "是否继续部署？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    print_message "构建 Docker 镜像..."
    docker build -t 51talk-business-card .
    
    print_message "启动 Docker 容器..."
    if [ -f "docker-compose.yml" ]; then
        docker-compose up -d
        print_message "使用 Docker Compose 启动完成"
    else
        docker run -d \
            --name 51talk-business-card \
            --env-file .env.production \
            -p 3000:3000 \
            51talk-business-card
        print_message "Docker 容器启动完成"
    fi
    
    print_message "Docker 部署完成！"
    print_message "应用运行在: http://localhost:3000"
}

# 服务器部署
deploy_server() {
    print_header "服务器部署"
    
    if ! command -v pm2 &> /dev/null; then
        print_message "安装 PM2..."
        npm install -g pm2
    fi
    
    # 检查环境变量文件
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production 文件不存在"
        print_message "请创建 .env.production 文件并配置环境变量"
        print_message "参考 env.production.example 文件"
        read -p "是否继续部署？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # 创建 PM2 配置文件
    if [ ! -f "ecosystem.config.js" ]; then
        print_message "创建 PM2 配置文件..."
        cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '51talk-business-card',
    script: 'npm',
    args: 'start',
    cwd: '$(pwd)',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF
    fi
    
    # 创建日志目录
    mkdir -p logs
    
    print_message "启动应用..."
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    print_message "服务器部署完成！"
    print_message "应用运行在: http://localhost:3000"
    print_message "使用 'pm2 status' 查看应用状态"
    print_message "使用 'pm2 logs' 查看日志"
}

# 主函数
main() {
    print_header "51Talk数字名片平台部署脚本"
    
    DEPLOY_TYPE=${1:-"help"}
    
    case $DEPLOY_TYPE in
        "vercel")
            check_requirements
            install_dependencies
            build_project
            deploy_vercel
            ;;
        "docker")
            check_requirements
            install_dependencies
            build_project
            deploy_docker
            ;;
        "server")
            check_requirements
            install_dependencies
            build_project
            deploy_server
            ;;
        "help"|*)
            echo "使用方法: $0 [vercel|docker|server]"
            echo ""
            echo "部署选项:"
            echo "  vercel  - 部署到 Vercel 平台"
            echo "  docker  - 使用 Docker 部署"
            echo "  server  - 部署到服务器 (使用 PM2)"
            echo ""
            echo "示例:"
            echo "  $0 vercel    # 部署到 Vercel"
            echo "  $0 docker   # 使用 Docker 部署"
            echo "  $0 server   # 部署到服务器"
            ;;
    esac
}

# 运行主函数
main "$@"

