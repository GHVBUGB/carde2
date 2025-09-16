'use client'

import { useState } from 'react'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, Image } from 'lucide-react'
import { useCardStore } from '@/store/card'
import { useAuthStore } from '@/store/auth'

interface SimpleDomExportProps {
  cardRef: React.RefObject<HTMLElement>
  className?: string
}

export default function SimpleDomExport({ 
  cardRef, 
  className = '' 
}: SimpleDomExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  
  const { user } = useAuthStore()
  const { cardData, textModules } = useCardStore()

  // 获取用户名用于文件命名
  const getUserName = () => {
    return cardData.name || textModules.name || user?.name || 'business-card'
  }

  // 🎯 简洁的DOM导出函数
  const exportCard = async (format: 'png' | 'jpeg' = 'png') => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在准备导出...')

    try {
      // 等待资源加载
      setStatus('等待资源加载...')
      
      // 等待图片加载完成
      const images = cardRef.current.querySelectorAll('img')
      if (images.length > 0) {
        await Promise.all(Array.from(images).map(img => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve
            setTimeout(resolve, 3000) // 3秒超时
          })
        }))
      }

      // 等待字体加载
      if (document.fonts) {
        await document.fonts.ready
      }

      // 短暂等待确保DOM稳定
      await new Promise(resolve => setTimeout(resolve, 300))

      setStatus('正在生成图片...')

      // 🎯 使用html2canvas导出
      const canvas = await html2canvas(cardRef.current, {
        width: 350,
        height: 500,
        scale: 2, // 高清晰度
        useCORS: true,
        allowTaint: false,
        backgroundColor: null, // 透明背景
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      })

      setStatus('正在处理图片...')

      // 转换为Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        }, `image/${format}`, format === 'jpeg' ? 0.9 : 1.0)
      })

      // 下载文件
      const filename = `${getUserName()}.${format}`
      saveAs(blob, filename)

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      setStatus(`✅ 导出成功！文件大小: ${fileSizeKB}KB`)

    } catch (error: any) {
      console.error('导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      // 3秒后清除状态
      setTimeout(() => setStatus(''), 3000)
    }
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-md font-semibold mb-2">导出名片</h3>
          <p className="text-xs text-gray-600">
            将您的名片导出为高清图片
          </p>
        </div>

        {/* 导出按钮 */}
        <div className="flex gap-3">
          <Button
            onClick={() => exportCard('png')}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2"
            variant="default"
          >
            <Image className="w-4 h-4" />
            PNG格式
          </Button>
          
          <Button
            onClick={() => exportCard('jpeg')}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            JPEG格式
          </Button>
        </div>

        {/* 状态显示 */}
        {(exporting || status) && (
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            {exporting && (
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">导出中...</span>
              </div>
            )}
            {status && (
              <p className={`text-sm ${
                status.startsWith('✅') 
                  ? 'text-green-600' 
                  : status.startsWith('❌')
                  ? 'text-red-600'
                  : 'text-blue-600'
              }`}>
                {status}
              </p>
            )}
          </div>
        )}

        {/* 说明 */}
        <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800">
          <div className="space-y-1">
            <div><strong>💡 使用说明:</strong></div>
            <div>• PNG格式: 透明背景，最高质量</div>
            <div>• JPEG格式: 白色背景，文件较小</div>
            <div>• 分辨率: 700x1000像素 (2倍高清)</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
