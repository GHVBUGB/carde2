'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { useCardStore } from '@/store/card'
import { supabase } from '@/lib/supabase/client'
import BusinessCardPreview from '@/components/card/business-card-preview'
import ExportOptions from '@/components/export/export-options'
import SimpleExportOptions from '@/components/export/simple-export-options'
import ExportProgress from '@/components/export/export-progress'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

interface ExportSettings {
  format: 'png' | 'jpg' | 'svg'
  quality: number
  scale: number
  width: number
  height: number
  backgroundColor: string
  background: string
}

export default function ExportPage() {
  const { user } = useAuthStore()
  const { avatarConfig, textModules, textStyles, textPositions, cardData } = useCardStore()
  const [exporting, setExporting] = useState(false)
  const [exportHistory, setExportHistory] = useState<any[]>([])
  const [progress, setProgress] = useState(0)
  const [currentTask, setCurrentTask] = useState('')
  const [totalTasks, setTotalTasks] = useState(0)
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 1,
    scale: 3,
    width: 350,
    height: 500,
    backgroundColor: '#ffffff',
    background: '#ffffff',
  })
  
  const cardRef = useRef<HTMLDivElement>(null)

  // 加载导出历史
  useEffect(() => {
    if (user) {
      loadExportHistory()
    }
  }, [user])

  const loadExportHistory = async () => {
    try {
      const { data } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', user?.id)
        .eq('action_type', 'download')
        .order('created_at', { ascending: false })
        .limit(10)
      
      setExportHistory(data || [])
    } catch (error) {
      console.error('Failed to load export history:', error)
    }
  }

  const handleExport = async () => {
    // 导出功能已移至实时预览模块，此页面导出功能已禁用
    alert('导出功能已移至实时预览模块，请在实时预览页面使用导出功能')
    return

    // 以下代码已禁用
    /*
    if (!cardRef.current || !user) return

    setExporting(true)
    try {
      let blob: Blob
      let filename: string

      if (settings.format === 'svg') {
        // SVG导出
        const svgData = generateSVG()
        blob = new Blob([svgData], { type: 'image/svg+xml' })
        filename = `${user.name || 'business-card'}-名片.svg`
      } else {
        // 使用html2canvas将名片转换为图片 - 修复压缩变形问题
        const canvas = await html2canvas(cardRef.current, {
          width: settings.width,
          height: settings.height,
          scale: settings.scale,
          backgroundColor: settings.backgroundColor === 'transparent' ? null : settings.backgroundColor,
          useCORS: true,
          allowTaint: true,
          logging: false,
          removeContainer: true,
          foreignObjectRendering: false, // 禁用foreignObjectRendering以避免字体渲染问题
          imageTimeout: 30000, // 增加超时时间
          // 修复图片压缩变形的关键配置
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0,
          // 保持原始比例，避免拉伸
          width: settings.width,
          height: settings.height,
          // 高质量渲染设置
          scale: Math.max(settings.scale, 2), // 确保至少2倍缩放以获得清晰图像
          // 像素比设置
          devicePixelRatio: window.devicePixelRatio || 1,
          // 避免图片压缩的设置
          canvas: document.createElement('canvas'), // 使用新的canvas避免污染
          onclone: (clonedDoc) => {
            // 确保克隆的文档中样式正确应用
            const clonedCard = clonedDoc.querySelector('[data-card-ref]')
            if (clonedCard) {
              clonedCard.style.transform = 'none'
              clonedCard.style.position = 'relative'
              // 保持背景图片的cover效果
              clonedCard.style.backgroundSize = 'cover'
              clonedCard.style.backgroundPosition = 'center'
              clonedCard.style.backgroundRepeat = 'no-repeat'
              // 确保图片不被压缩变形
              const images = clonedCard.querySelectorAll('img')
              images.forEach(img => {
                img.style.objectFit = 'cover'
                img.style.objectPosition = 'center'
                img.style.width = '100%'
                img.style.height = '100%'
              })
            }
          }
        })

        // 转换为指定格式 - 修复零压缩导出失败问题
        if (settings.format === 'jpg') {
          blob = await new Promise<Blob>((resolve, reject) => {
            // 使用toDataURL作为备选方案，避免零压缩失败
            try {
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(blob)
                } else {
                  // 如果toBlob失败，使用toDataURL作为备选
                  const dataURL = canvas.toDataURL('image/jpeg', settings.quality)
                  const byteString = atob(dataURL.split(',')[1])
                  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
                  const ab = new ArrayBuffer(byteString.length)
                  const ia = new Uint8Array(ab)
                  for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i)
                  }
                  resolve(new Blob([ab], { type: mimeString }))
                }
              }, 'image/jpeg', settings.quality)
            } catch (error) {
              reject(error)
            }
          })
        } else {
          blob = await new Promise<Blob>((resolve, reject) => {
            // PNG格式处理 - 零压缩优化
            try {
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(blob)
                } else {
                  // 如果toBlob失败，使用toDataURL作为备选
                  const dataURL = canvas.toDataURL('image/png')
                  const byteString = atob(dataURL.split(',')[1])
                  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
                  const ab = new ArrayBuffer(byteString.length)
                  const ia = new Uint8Array(ab)
                  for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i)
                  }
                  resolve(new Blob([ab], { type: mimeString }))
                }
              }, 'image/png')
            } catch (error) {
              reject(error)
            }
          })
        }
        filename = `${user.name || 'business-card'}-بطاقة.${settings.format}`
      }

      // 使用file-saver下载文件
      saveAs(blob, filename)

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
            timestamp: new Date().toISOString(),
          },
        })

      // 重新加载导出历史
      await loadExportHistory()

    } catch (error) {
      console.error('Export failed:', error)
      alert('导出失败，请稍后重试')
    } finally {
      setExporting(false)
    }
    */
  }

  // 生成SVG
  const generateSVG = () => {
    if (!user) return ''
    
    const svgContent = `
      <svg width="${settings.width}" height="${settings.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .card-text { font-family: Arial, sans-serif; }
            .name-text { font-size: ${textStyles.name.fontSize}px; font-weight: ${textStyles.name.fontWeight}; fill: ${textStyles.name.color}; }
            .title-text { font-size: ${textStyles.title.fontSize}px; font-weight: ${textStyles.title.fontWeight}; fill: ${textStyles.title.color}; }
            .phone-text { font-size: ${textStyles.phone.fontSize}px; font-weight: ${textStyles.phone.fontWeight}; fill: ${textStyles.phone.color}; }
          </style>
        </defs>
        <rect width="100%" height="100%" fill="${settings.background === 'transparent' ? 'white' : settings.background}"/>
        ${user.avatar_url ? `
          <defs>
            <clipPath id="avatarClip">
              <circle cx="${avatarConfig.position.x + avatarConfig.size/2}" cy="${avatarConfig.position.y + avatarConfig.size/2}" r="${avatarConfig.size/2}"/>
            </clipPath>
          </defs>
          <image href="${user.avatar_url}" x="${avatarConfig.position.x}" y="${avatarConfig.position.y}" 
                 width="${avatarConfig.size}" height="${avatarConfig.size}" clip-path="url(#avatarClip)"/>
        ` : ''}
        <text x="${textPositions.name.x}" y="${textPositions.name.y}" class="card-text name-text">${textModules.name || user.name}</text>
        <text x="${textPositions.title.x}" y="${textPositions.title.y}" class="card-text title-text">${textModules.title || user.title}</text>
        <text x="${textPositions.phone.x}" y="${textPositions.phone.y}" class="card-text phone-text">${textModules.phone || user.phone}</text>
      </svg>
    `
    return svgContent
  }

  // 批量导出功能
  const handleBatchExport = async () => {
    if (!user) return

    const formats = ['png', 'jpg', 'svg'] as const
    const sizes = [
      { name: '标准', width: 400, height: 600 },
      { name: '高清', width: 800, height: 1200 },
      { name: '方形', width: 500, height: 500 },
    ]

    const totalTasks = formats.length * sizes.length
    setTotalTasks(totalTasks)
    setProgress(0)
    setExporting(true)
    
    try {
      let completedTasks = 0
      
      for (const format of formats) {
        for (const size of sizes) {
          setCurrentTask(`جاري تصدير تنسيق ${format.toUpperCase()} - ${size.name} (${size.width}x${size.height})`)
          
          const currentSettings = {
            ...settings,
            format,
            width: size.width,
            height: size.height,
          }
          
          // 临时更新设置
          const originalSettings = { ...settings }
          setSettings(currentSettings)
          
          // 等待设置更新
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // 执行导出
          await handleExport()
          
          // 恢复原始设置
          setSettings(originalSettings)
          
          // 更新进度
          completedTasks++
          setProgress((completedTasks / totalTasks) * 100)
          
          // 等待一下再进行下一次导出
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      setCurrentTask('تم إكمال التصدير المجمع!')
      setTimeout(() => {
        alert('تم إكمال التصدير المجمع!')
        setExporting(false)
        setProgress(0)
        setCurrentTask('')
      }, 1000)
      
    } catch (error) {
      console.error('Batch export failed:', error)
      alert('فشل التصدير المجمع، يرجى المحاولة لاحقاً')
      setExporting(false)
      setProgress(0)
      setCurrentTask('')
    }
  }

  const handleShare = async () => {
    if (!user) return

    const shareData = {
      title: `بطاقة ${user.name} الرقمية`,
      text: `شاهد بطاقة 51Talk الرقمية الخاصة بي`,
      url: `${window.location.origin}/card/${user.id}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // 备用方案：复制链接到剪贴板
        await navigator.clipboard.writeText(shareData.url)
        alert('تم نسخ رابط البطاقة إلى الحافظة')
      }

      // 记录分享统计
      await supabase
        .from('usage_stats')
        .insert({
          user_id: user.id,
          action_type: 'share',
          details: { method: typeof navigator.share === 'function' ? 'native' : 'clipboard' },
        })

    } catch (error) {
      console.error('Share failed:', error)
      // 如果分享失败，尝试复制链接
      try {
        await navigator.clipboard.writeText(shareData.url)
        alert('تم نسخ رابط البطاقة إلى الحافظة')
      } catch {
        alert('فشل المشاركة، يرجى نسخ الرابط يدوياً')
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
      {/* 重要提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800" dir="rtl">تم نقل وظيفة التصدير</h3>
            <p className="mt-1 text-sm text-blue-700" dir="rtl">
              تم نقل وظيفة التصدير في هذه الصفحة إلى <strong>وحدة المعاينة المباشرة</strong>. يرجى استخدام وظيفة التصدير في صفحة المعاينة المباشرة، حيث تم تحسينها وإصلاح جميع المشاكل.
            </p>
            <div className="mt-2">
              <a 
                href="/dashboard" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500 underline"
              >
                الذهاب إلى صفحة المعاينة المباشرة →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark mb-2" dir="rtl">تصدير البطاقة</h1>
        <p className="text-brand-gray" dir="rtl">
          تصدير بطاقتك الرقمية كصورة أو رابط مشاركة
        </p>
      </div>

      <div className="grid lg:grid-cols-1 gap-6">
        {/* 导出设置 - 已禁用 */}
        <div className="space-y-6 hidden">
          {/* ExportOptions组件已禁用 */}

          {/* 导出操作 */}
          <Card>
            <CardHeader>
              <CardTitle dir="rtl">عمليات التصدير</CardTitle>
              <CardDescription dir="rtl">
                اختر طريقة التصدير
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
                    <span dir="rtl">جاري التصدير...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span dir="rtl">تحميل الصورة</span>
                  </div>
                )}
              </Button>

              <Button
                onClick={handleBatchExport}
                disabled={exporting}
                variant="outline"
                className="w-full"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span dir="rtl">تصدير مجمع</span>
                </div>
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
                  <span dir="rtl">مشاركة رابط البطاقة</span>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* 简化导出选项 - 已禁用 */}
          {/* SimpleExportOptions组件已禁用 */}

          {/* 导出历史 */}
          <Card>
            <CardHeader>
              <CardTitle dir="rtl">تاريخ التصدير</CardTitle>
              <CardDescription dir="rtl">
                عرض سجلات التصدير الأخيرة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exportHistory.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {exportHistory.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          record.details?.format === 'png' ? 'bg-blue-100 text-blue-600' :
                          record.details?.format === 'jpg' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {record.details?.format?.toUpperCase() || 'IMG'}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {record.details?.dimensions || 'أبعاد غير معروفة'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(record.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {record.details?.quality ? `${Math.round(record.details.quality * 100)}%` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  暂无导出记录
                </div>
              )}
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
                  <span>SVG格式为矢量图，可无损缩放</span>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>批量导出可一次性生成多种格式和尺寸</span>
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

        {/* 预览区域 - 已禁用 */}
        <div className="lg:sticky lg:top-6 hidden">
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
                  backgroundColor: settings.background === 'transparent' ? 'white' : settings.background,
                  transform: 'scale(0.8)',
                  transformOrigin: 'top left',
                }}
                className="mx-auto border rounded-lg overflow-hidden"
              >
                <BusinessCardPreview
                  user={user}
                  textModules={textModules}
                  textStyles={textStyles}
                  abilities={{
                    teacherScreening: cardData.teacherScreening,
                    feedbackAbility: cardData.feedbackAbility,
                    planningAbility: cardData.planningAbility,
                    resourceSharing: cardData.resourceSharing,
                  }}
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

      {/* 导出进度 - 已禁用 */}
      <ExportProgress
        isVisible={false}
        progress={0}
        currentTask=""
        totalTasks={0}
        onCancel={() => {
          setExporting(false)
          setProgress(0)
          setCurrentTask('')
        }}
      />
    </div>
  )
}
