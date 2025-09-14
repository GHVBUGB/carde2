import { createServerClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export default async function RecentUsersTable() {
  const supabase = createServerClient()
  
  const { data: recentUsers, error } = await supabase
    .from('users')
    .select('id, name, email, title, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>加载用户数据失败</p>
      </div>
    )
  }

  if (!recentUsers || recentUsers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        <p>暂无用户数据</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-brand-dark">用户</th>
            <th className="text-left py-3 px-4 font-medium text-brand-dark">邮箱</th>
            <th className="text-left py-3 px-4 font-medium text-brand-dark">职位</th>
            <th className="text-left py-3 px-4 font-medium text-brand-dark">注册时间</th>
            <th className="text-left py-3 px-4 font-medium text-brand-dark">操作</th>
          </tr>
        </thead>
        <tbody>
          {recentUsers.map((user) => (
            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-brand-primary font-medium text-sm">
                      {user.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-brand-dark">
                      {user.name || '未设置'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-brand-gray">
                {user.email}
              </td>
              <td className="py-3 px-4">
                {user.title ? (
                  <span className="badge-primary">
                    {user.title}
                  </span>
                ) : (
                  <span className="text-gray-400">未设置</span>
                )}
              </td>
              <td className="py-3 px-4 text-brand-gray">
                {formatDate(user.created_at)}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <button className="text-brand-primary hover:text-brand-primary/80 text-sm">
                    查看
                  </button>
                  <button className="text-brand-gray hover:text-brand-dark text-sm">
                    编辑
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 查看更多链接 */}
      <div className="mt-4 text-center">
        <a
          href="/admin/users"
          className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium"
        >
          查看所有用户 →
        </a>
      </div>
    </div>
  )
}
