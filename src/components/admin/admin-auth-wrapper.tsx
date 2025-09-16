'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 检查管理员登录状态
    const checkAdminAuth = () => {
      const isLoggedIn = localStorage.getItem('admin_logged_in')
      const adminEmail = localStorage.getItem('admin_email')
      
      if (isLoggedIn === 'true' && adminEmail) {
        setIsAuthenticated(true)
      } else {
        // 未登录，重定向到登录页面
        router.push('/admin/login')
        return
      }
      
      setIsLoading(false)
    }

    checkAdminAuth()
  }, [router])

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">验证管理员权限...</p>
        </div>
      </div>
    )
  }

  // 已认证，显示内容
  if (isAuthenticated) {
    return <>{children}</>
  }

  // 未认证，不显示任何内容（会被重定向）
  return null
}

