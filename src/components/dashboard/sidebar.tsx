'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const sidebarItems = [
  {
    href: '/dashboard',
    label: 'نظرة عامة',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/editor',
    label: 'تعديل البطاقة',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/export',
    label: 'تصدير البطاقة',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/profile',
    label: 'الإعدادات الشخصية',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-primary text-white'
                    : 'text-brand-gray hover:bg-brand-light/50 hover:text-brand-dark'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* 快速操作区域 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-brand-dark mb-3" dir="rtl">عمليات سريعة</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-brand-gray hover:bg-brand-light/50 hover:text-brand-dark rounded-lg transition-colors">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span dir="rtl">مشاركة البطاقة</span>
              </div>
            </button>
            
            <button className="w-full text-left px-3 py-2 text-sm text-brand-gray hover:bg-brand-light/50 hover:text-brand-dark rounded-lg transition-colors">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span dir="rtl">تحميل البطاقة</span>
              </div>
            </button>
          </div>
        </div>

        {/* 帮助区域 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-brand-dark mb-3" dir="rtl">المساعدة والدعم</h3>
          <div className="space-y-2">
            <Link 
              href="#" 
              className="block px-3 py-2 text-sm text-brand-gray hover:bg-brand-light/50 hover:text-brand-dark rounded-lg transition-colors"
            >
              دليل الاستخدام
            </Link>
            <Link 
              href="#" 
              className="block px-3 py-2 text-sm text-brand-gray hover:bg-brand-light/50 hover:text-brand-dark rounded-lg transition-colors"
            >
              الأسئلة الشائعة
            </Link>
            <Link 
              href="#" 
              className="block px-3 py-2 text-sm text-brand-gray hover:bg-brand-light/50 hover:text-brand-dark rounded-lg transition-colors"
            >
              الاتصال بالدعم
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
