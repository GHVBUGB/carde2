'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase/client'
import BusinessCardPreview from '@/components/card/preview'
import ExportOptions from '@/components/export/export-options'
import html2canvas from 'html2canvas'

interface ExportSettings {
  format: 'png' | 'jpg' | 'svg'
  quality: number
  width: number
  height: number
  background: string
}

export default function ExportPage() {
  const { user } = useAuthStore()
  const [exporting, setExporting] = useState(false)
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 1,
    width: 400,
    height: 600,
    background: '#ffffff',
  })
  
  const cardRef = useRef<HTMLDivElement>(null)

  const handleExport = async () => {
    if (!cardRef.current || !user) return

    setExporting(true)
    try {
      // 使用html2canvas将名片转换为图片
      const canvas = await html2canvas(cardRef.current, {
        width: settings.width,
        height: settings.height,
        scale: 2, // 提高分辨率
        backgroundColor: settings.background,
        useCORS: true,
        allowTaint: true,
      })

      // 转换为指定格式
      let dataUrl: string
      if (settings.format === 'jpg') {
        dataUrl = canvas.toDataURL('image/jpeg', settings.quality)
      } else {
        dataUrl = canvas.toDataURL('image/png')
      }

      // 创建下载链接
      const link = document.createElement('a')
      link.download = `${user.name || 'business-card'}-名片.${settings.format}`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // 记录下载统计
      await supabase
        .from('usage_stats')
        .insert({
          user_id: user.id,
          action_type: 'download',
          details: {
            format: settings.format,
            quality: settings.quality,
            dimensions: `${settings.width}x${settings.height}`,
          },
        })

    } catch (error) {
      console.error('Export failed:', error)
      alert('导出失败，请稍后重试')
    } finally {
      setExporting(false)
    }
  }

  const handleShare = async () => {
    if (!user) return

    const shareData = {
      title: `${user.name}的数字名片`,
      text: `查看我的51Talk数字名片`,
      url: `${window.location.origin}/card/${user.id}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // 备用方案：复制链接到剪贴板
        await navigator.clipboard.writeText(shareData.url)
        alert('名片链接已复制到剪贴板')
      }

      // 记录分享统计
      await supabase
        .from('usage_stats')
        .insert({
          user_id: user.id,
          action_type: 'share',
          details: { method: navigator.share ? 'native' : 'clipboard' },
        })

    } catch (error) {
      console.error('Share failed:', error)
      // 如果分享失败，尝试复制链接
      try {
        await navigator.clipboard.writeText(shareData.url)
        alert('名片链接已复制到剪贴板')
      } catch {
        alert('分享失败，请手动复制链接')
      }
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark mb-2">导出名片</h1>
        <p className="text-brand-gray">
          将您的数字名片导出为图片或分享链接
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 导出设置 */}
        <div className="space-y-6">
          <ExportOptions
            settings={settings}
            onSettingsChange={setSettings}
          />

          {/* 导出操作 */}
          <Card>
            <CardHeader>
              <CardTitle>导出操作</CardTitle>
              <CardDescription>
                选择导出方式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="w-full btn-primary"
              >
                {exporting ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-spinner w-4 h-4"></div>
                    <span>导出中...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>下载图片</span>
                  </div>
                )}
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>分享名片链接</span>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* 使用说明 */}
          <Card>
            <CardHeader>
              <CardTitle>导出说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-brand-gray">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>PNG格式支持透明背景，适合制作透明名片</span>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>JPG格式文件更小，适合邮件发送和社交媒体</span>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>建议选择高质量设置以获得最佳打印效果</span>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>分享链接可让他人在线查看您的名片</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 预览区域 */}
        <div className="lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle>导出预览</CardTitle>
              <CardDescription>
                预览导出后的名片效果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                ref={cardRef}
                style={{
                  width: `${settings.width}px`,
                  height: `${settings.height}px`,
                  backgroundColor: settings.background,
                  transform: 'scale(0.8)',
                  transformOrigin: 'top left',
                }}
                className="mx-auto border rounded-lg overflow-hidden"
              >
                <BusinessCardPreview
                  user={user}
                  className="w-full h-full flex flex-col justify-center"
                />
              </div>

              {/* 尺寸信息 */}
              <div className="mt-4 text-center text-sm text-brand-gray">
                尺寸: {settings.width} × {settings.height} 像素
                <br />
                格式: {settings.format.toUpperCase()}
                {settings.format === 'jpg' && ` (质量: ${Math.round(settings.quality * 100)}%)`}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
