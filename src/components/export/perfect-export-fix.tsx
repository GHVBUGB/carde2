'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { useAuthStore } from '@/store/auth'

interface PerfectExportFixProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function PerfectExportFix({ 
  cardRef, 
  className = '' 
}: PerfectExportFixProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  
  const { user } = useAuthStore()

  // 🎯 完美导出 - 不改变任何布局，只提高质量
  const perfectExport = async (format: 'png' | 'jpeg', quality: 'standard' | 'high' | 'ultra') => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在准备导出...')

    try {
      const element = cardRef.current
      
      // 等待所有图片加载完成
      setStatus('等待图片加载...')
      await waitForImages(element)
      
      // 等待字体加载
      if (document.fonts) {
        await document.fonts.ready
      }
      
      // 短暂等待确保渲染稳定
      await new Promise(resolve => setTimeout(resolve, 300))

      setStatus('正在生成高清图片...')

      // 🔥 关键：使用最简单最可靠的配置
      const scaleMap = { standard: 2, high: 3, ultra: 4 }
      const scale = scaleMap[quality]

      const canvas = await html2canvas(element, {
        // 基础设置
        scale: scale,
        useCORS: true,
        allowTaint: false,
        logging: false,
        
        // 🔥 关键：不强制设置width/height，让html2canvas自动检测
        // width: undefined, 
        // height: undefined,
        
        // 背景设置
        backgroundColor: null, // 保持透明，让原始背景显示
        
        // 渲染优化
        imageTimeout: 30000,
        removeContainer: true,
        scrollX: 0,
        scrollY: 0,
        
        // 🔥 关键：不使用onclone回调，避免破坏原有布局
      })

      setStatus('正在处理图片...')
      
      // 转换为Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
        const imageQuality = format === 'png' ? 1.0 : 0.95
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('无法生成图片文件'))
          }
        }, mimeType, imageQuality)
      })
      
      // 下载文件
      const filename = `${user?.name || 'business-card'}-perfect-${quality}.${format}`
      saveAs(blob, filename)

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      const dimensions = `${canvas.width}×${canvas.height}`
      setStatus(`✅ 完美导出成功！尺寸: ${dimensions}, 大小: ${fileSizeKB}KB`)

      console.log('✅ 完美导出详情:', {
        原始元素尺寸: {
          width: element.offsetWidth,
          height: element.offsetHeight
        },
        画布尺寸: {
          width: canvas.width,
          height: canvas.height
        },
        缩放比例: scale,
        文件大小: fileSizeKB + 'KB'
      })

    } catch (error: any) {
      console.error('❌ 完美导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 5000)
    }
  }

  // 等待图片加载完成
  const waitForImages = async (element: HTMLElement): Promise<void> => {
    const images = element.querySelectorAll('img')
    const promises: Promise<void>[] = []

    images.forEach(img => {
      if (img.complete && img.naturalHeight !== 0) {
        return // 已经加载完成
      }
      
      promises.push(new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('图片加载超时:', img.src)
          resolve()
        }, 10000)

        img.onload = () => {
          clearTimeout(timeout)
          resolve()
        }
        img.onerror = () => {
          clearTimeout(timeout)
          console.warn('图片加载失败:', img.src)
          resolve() // 继续执行，不因单个图片失败而中断
        }
      }))
    })

    if (promises.length > 0) {
      await Promise.all(promises)
    }
  }

  return (
    <Card className={`p-4 ${className} border-2 border-green-500`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-700">🎯 完美导出修复版</h3>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            保持原布局
          </Badge>
        </div>

        {/* 快速导出按钮 */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => perfectExport('png', 'high')}
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            {exporting ? '导出中...' : '高清PNG (推荐)'}
          </Button>
          <Button
            onClick={() => perfectExport('jpeg', 'high')}
            disabled={exporting}
            variant="outline"
            size="sm"
          >
            {exporting ? '导出中...' : '高清JPEG'}
          </Button>
        </div>

        {/* 质量选择 */}
        <div className="grid grid-cols-3 gap-1">
          <Button
            onClick={() => perfectExport('png', 'standard')}
            disabled={exporting}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            标准 (2x)
          </Button>
          <Button
            onClick={() => perfectExport('png', 'high')}
            disabled={exporting}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            高清 (3x)
          </Button>
          <Button
            onClick={() => perfectExport('png', 'ultra')}
            disabled={exporting}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            超清 (4x)
          </Button>
        </div>

        {/* 状态显示 */}
        {status && (
          <div className={`text-sm text-center p-2 rounded ${
            status.includes('✅') ? 'bg-green-50 text-green-700' :
            status.includes('❌') ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {status}
          </div>
        )}

        {/* 说明 */}
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-semibold text-green-700">✨ 修复内容：</div>
          <div>• 保持原有布局和背景</div>
          <div>• 不强制改变元素尺寸</div>
          <div>• 仅通过scale提高清晰度</div>
          <div>• 完整保留所有样式</div>
        </div>
      </div>
    </Card>
  )
}
