'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase/client'

export default function DashboardNav() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">51</span>
          </div>
          <span className="text-lg font-bold text-brand-dark" dir="rtl">بطاقة Talk</span>
        </Link>

        {/* 导航链接 */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            href="/dashboard" 
            className="text-brand-gray hover:text-brand-dark transition-colors"
          >
            نظرة عامة
          </Link>
          <Link 
            href="/dashboard/editor" 
            className="text-brand-gray hover:text-brand-dark transition-colors"
          >
            تعديل البطاقة
          </Link>
          <Link 
            href="/dashboard/export" 
            className="text-brand-gray hover:text-brand-dark transition-colors"
          >
            تصدير البطاقة
          </Link>
          <Link 
            href="/dashboard/profile" 
            className="text-brand-gray hover:text-brand-dark transition-colors"
          >
            الإعدادات الشخصية
          </Link>
        </div>

        {/* 用户菜单 */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 text-brand-gray hover:text-brand-dark transition-colors"
          >
            <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name || 'صورة المستخدم'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-brand-primary font-medium text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <span className="hidden sm:block" dir="rtl">{user?.name || 'المستخدم'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 下拉菜单 */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-brand-dark">{user?.name}</p>
                <p className="text-xs text-brand-gray">{user?.email}</p>
              </div>
              
              <Link
                href="/dashboard/profile"
                className="block px-4 py-2 text-sm text-brand-gray hover:bg-gray-50 hover:text-brand-dark"
                onClick={() => setShowUserMenu(false)}
              >
                الإعدادات الشخصية
              </Link>
              
              <Link
                href="/dashboard/export"
                className="block px-4 py-2 text-sm text-brand-gray hover:bg-gray-50 hover:text-brand-dark"
                onClick={() => setShowUserMenu(false)}
              >
                تصدير البطاقة
              </Link>
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 移动端导航菜单 */}
      <div className="md:hidden mt-4 pt-4 border-t border-gray-100">
        <div className="flex space-x-4">
          <Link 
            href="/dashboard" 
            className="text-sm text-brand-gray hover:text-brand-dark"
          >
            نظرة عامة
          </Link>
          <Link 
            href="/dashboard/editor" 
            className="text-sm text-brand-gray hover:text-brand-dark"
          >
            تعديل
          </Link>
          <Link 
            href="/dashboard/export" 
            className="text-sm text-brand-gray hover:text-brand-dark"
          >
            تصدير
          </Link>
          <Link 
            href="/dashboard/profile" 
            className="text-sm text-brand-gray hover:text-brand-dark"
          >
            إعدادات
          </Link>
        </div>
      </div>
    </nav>
  )
}
