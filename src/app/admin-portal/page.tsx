import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">51Talk 管理员门户</h1>
          <p className="text-gray-600 mt-2">名片平台管理中心</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 管理员登录 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔐 管理员登录
              </CardTitle>
              <CardDescription>
                使用51Talk管理员账号登录管理面板
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p>• 实时监控平台使用情况</p>
                <p>• 用户注册和活动统计</p>
                <p>• API调用次数监控</p>
                <p>• 自动告警邮件提醒</p>
              </div>
              <Link href="/admin/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  进入管理员登录
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 用户登录 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👤 用户登录
              </CardTitle>
              <CardDescription>
                普通员工登录制作数字名片
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p>• 制作个性化数字名片</p>
                <p>• 上传头像智能抠图</p>
                <p>• 多格式导出下载</p>
                <p>• 实时预览效果</p>
              </div>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  普通用户登录
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 功能说明 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>🚨 管理员监控功能</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">智能告警系统</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 抠图API &gt; 5次/天</li>
                    <li>• 下载次数 &gt; 5次/天</li>
                    <li>• 新注册 &gt; 5个/天</li>
                    <li>• 自动邮件提醒</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">实时监控面板</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 用户注册统计</li>
                    <li>• 登录活动监控</li>
                    <li>• API使用统计</li>
                    <li>• 30秒自动刷新</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">用户管理系统</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 详细用户信息</li>
                    <li>• 使用频次统计</li>
                    <li>• 异常行为检测</li>
                    <li>• 数据可视化</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 底部链接 */}
        <div className="mt-8 text-center">
          <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              返回首页
            </Link>
            <span>|</span>
            <Link href="/register" className="hover:text-blue-600 transition-colors">
              新用户注册
            </Link>
            <span>|</span>
            <a href="mailto:admin@51talk.com" className="hover:text-blue-600 transition-colors">
              技术支持
            </a>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <p>&copy; 2024 51Talk Online Education. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
