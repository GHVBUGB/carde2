import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { adminStatsService } from '@/lib/supabase/server'
import AdminStatsCards from '@/components/admin/stats-cards'
import UserRegistrationChart from '@/components/admin/charts/user-registration'
import PopularTitlesChart from '@/components/admin/charts/popular-titles'
import ActivityChart from '@/components/admin/charts/activity'
import RecentUsersTable from '@/components/admin/tables/recent-users'

export default async function AdminDashboard() {
  // 获取统计数据
  const [
    overviewStats,
    userTrend,
    popularTitles,
    activityStats
  ] = await Promise.all([
    adminStatsService.getOverviewStats(),
    adminStatsService.getUserRegistrationTrend(30),
    adminStatsService.getPopularTitles(),
    adminStatsService.getDailyActivityStats(30)
  ])

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-brand-dark">管理员面板</h1>
        <p className="text-brand-gray mt-1">
          51Talk名片平台运营数据总览
        </p>
      </div>

      {/* 统计卡片 */}
      <AdminStatsCards stats={overviewStats} />

      {/* 图表区域 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 用户注册趋势 */}
        <Card>
          <CardHeader>
            <CardTitle>用户注册趋势</CardTitle>
            <CardDescription>
              过去30天的用户注册情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-64 flex items-center justify-center">
              <div className="loading-spinner w-6 h-6"></div>
            </div>}>
              <UserRegistrationChart data={userTrend} />
            </Suspense>
          </CardContent>
        </Card>

        {/* 热门职位统计 */}
        <Card>
          <CardHeader>
            <CardTitle>热门职位分布</CardTitle>
            <CardDescription>
              各职位头衔的用户分布情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-64 flex items-center justify-center">
              <div className="loading-spinner w-6 h-6"></div>
            </div>}>
              <PopularTitlesChart data={popularTitles} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* 活动统计 */}
      <Card>
        <CardHeader>
          <CardTitle>平台活动统计</CardTitle>
          <CardDescription>
            用户活动和功能使用情况
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-64 flex items-center justify-center">
            <div className="loading-spinner w-6 h-6"></div>
          </div>}>
            <ActivityChart data={activityStats} />
          </Suspense>
        </CardContent>
      </Card>

      {/* 最新用户表格 */}
      <Card>
        <CardHeader>
          <CardTitle>最新注册用户</CardTitle>
          <CardDescription>
            最近注册的用户列表
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-32 flex items-center justify-center">
            <div className="loading-spinner w-6 h-6"></div>
          </div>}>
            <RecentUsersTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
