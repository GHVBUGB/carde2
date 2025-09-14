'use client'

import { useState, useEffect } from 'react'

interface ResponsiveWrapperProps {
  children: React.ReactNode
  mobileComponent?: React.ReactNode
  breakpoint?: number
}

export default function ResponsiveWrapper({
  children,
  mobileComponent,
  breakpoint = 768
}: ResponsiveWrapperProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)

    return () => window.removeEventListener('resize', checkIfMobile)
  }, [breakpoint])

  // 避免hydration不匹配
  if (!mounted) {
    return <div className="min-h-[200px] flex items-center justify-center">
      <div className="loading-spinner w-6 h-6"></div>
    </div>
  }

  if (isMobile && mobileComponent) {
    return <>{mobileComponent}</>
  }

  return <>{children}</>
}

// 移动端表格组件
export function MobileTable<T extends Record<string, any>>({
  data,
  keyField,
  renderCard
}: {
  data: T[]
  keyField: keyof T
  renderCard: (item: T) => React.ReactNode
}) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item[keyField]} className="mobile-card">
          {renderCard(item)}
        </div>
      ))}
    </div>
  )
}

// 移动端统计卡片
export function MobileStatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {children}
    </div>
  )
}

// 移动端导航抽屉
export function MobileDrawer({
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* 侧边栏 */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform lg:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">菜单</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </>
  )
}
