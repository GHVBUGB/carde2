import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light/50">
      {/* 导航栏 */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">51</span>
            </div>
            <span className="text-xl font-bold text-brand-dark">Talk名片</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-brand-dark hover:bg-brand-primary/10">
                登录
              </Button>
            </Link>
            <Link href="/register">
              <Button className="btn-primary">
                开始制作
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="relative">
        {/* Hero 区域 */}
        <section className="px-6 pt-16 pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-brand-dark">打造专属的</span>
              <br />
              <span className="brand-text">数字名片</span>
            </h1>
            
            <p className="text-xl text-brand-gray mb-8 max-w-2xl mx-auto leading-relaxed">
              为51Talk员工量身定制的数字名片平台，展示您的专业形象，
              <br />
              提升业务影响力，让每一次介绍都更加出色。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/register">
                <Button className="btn-primary text-lg px-8 py-4 min-w-[160px]">
                  立即开始
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="ghost" className="text-lg px-8 py-4 text-brand-dark hover:bg-brand-primary/10">
                  查看演示
                </Button>
              </Link>
            </div>

            {/* 数据展示 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">1000+</div>
                <div className="text-sm text-brand-gray">活跃用户</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">5000+</div>
                <div className="text-sm text-brand-gray">名片生成</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">99%</div>
                <div className="text-sm text-brand-gray">满意度</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">24/7</div>
                <div className="text-sm text-brand-gray">技术支持</div>
              </div>
            </div>
          </div>
        </section>

        {/* 功能特色 */}
        <section className="px-6 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-brand-dark">
              为什么选择我们
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg hover:bg-brand-light/50 transition-colors">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-brand-dark">智能头像处理</h3>
                <p className="text-brand-gray">
                  AI自动抠图技术，一键生成专业头像，
                  让您的形象更加突出专业。
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg hover:bg-brand-light/50 transition-colors">
                <div className="w-16 h-16 bg-brand-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-brand-dark">拖拽式设计</h3>
                <p className="text-brand-gray">
                  可视化编辑器，自由拖拽布局，
                  无需设计经验也能制作精美名片。
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg hover:bg-brand-light/50 transition-colors">
                <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-brand-dark">安全可靠</h3>
                <p className="text-brand-gray">
                  企业级安全保障，数据加密传输，
                  您的信息安全我们来守护。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 演示区域 */}
        <section id="demo" className="px-6 py-16 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-brand-dark">
              快速预览效果
            </h2>
            
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-md mx-auto">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex-shrink-0"></div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-brand-dark mb-1">张老师</h3>
                  <p className="text-brand-primary text-sm mb-2">首席成长伙伴</p>
                  <div className="space-y-1 text-sm text-brand-gray">
                    <p>📚 已服务学员：1,200+</p>
                    <p>⭐ 好评率：4.95/5.0</p>
                    <p>📞 联系电话：138-0000-0000</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="badge-primary">外教筛选</span>
                    <span className="badge-secondary">学情反馈</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-brand-gray mb-6">
              支持多种导出格式，一键分享到微信、邮件等平台
            </p>
            
            <Link href="/register">
              <Button className="btn-primary text-lg px-8 py-4">
                开始制作我的名片
              </Button>
            </Link>
          </div>
        </section>

        {/* 页脚 */}
        <footer className="bg-brand-dark text-white px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-brand-primary rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">51</span>
                  </div>
                  <span className="text-lg font-bold">Talk名片</span>
                </div>
                <p className="text-gray-400 text-sm">
                  51Talk员工专属数字名片平台
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">快速链接</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/login" className="hover:text-white transition-colors">登录</Link></li>
                  <li><Link href="/register" className="hover:text-white transition-colors">注册</Link></li>
                  <li><Link href="#demo" className="hover:text-white transition-colors">演示</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">帮助支持</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">使用指南</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">常见问题</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">技术支持</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">联系我们</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>邮箱：tech-support@51talk.com</p>
                  <p>企业微信技术支持群</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
              <p>&copy; 2024 51Talk Online Education. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
