'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminRedirect() {
  const router = useRouter()

  useEffect(() => {
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    
    console.log('Admin redirect: isLoggedIn =', isLoggedIn)
    
    if (isLoggedIn === 'true') {
      // 已登录，跳转到仪表板
      console.log('Redirecting to dashboard...')
      router.push('/admin/dashboard')
    } else {
      // 未登录，跳转到登录页面
      console.log('Redirecting to login...')
      router.push('/admin/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转管理员页面...</p>
      </div>
    </div>
  )
}