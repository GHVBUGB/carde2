'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import domtoimage from 'dom-to-image-more'
import { useAuthStore } from '@/store/auth'

interface SimpleDomExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function SimpleDomExport({ 
  cardRef, 
  className = '' 
}: SimpleDomExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  
  const { user } = useAuthStore()

  // 简单的DOM导出
  const simpleDomExport = async (format: 'png' | 'jpeg' = 'png') => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在导出...')

    try {
      const startTime = Date.now()
      const domNode = cardRef.current
      
      // 最简单的配置
      const options = {
        width: 350,
        height: 500,
        quality: format === 'png' ? 1.0 : 0.95,
        bgcolor: '#ffffff',
        cacheBust: true,
        pixelRatio: 1, // 使用1倍像素比，避免复杂问题
      }

      let dataUrl: string
      if (format === 'png') {
        dataUrl = await domtoimage.toPng(domNode, options)
      } else {
        dataUrl = await domtoimage.toJpeg(domNode, options)
      }
      
      // 转换为blob并下载
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      const filename = `${user?.name || 'business-card'}-simple.${format}`
      saveAs(blob, filename)

      const duration = Date.now() - startTime
      const fileSizeKB = (blob.size / 1024).toFixed(1)
      setStatus(`✅ 导出成功！大小: ${fileSizeKB}KB, 耗时: ${duration}ms`)

    } catch (error: any) {
      console.error('❌ 导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 5000)
    }
  }

  return (
    <Card className={`p-4 ${className} border-2 border-blue-500`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-blue-700">📷 简单DOM导出</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            基础导出
          </Badge>
        </div>
        
        <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
          <strong>说明：</strong>最简单的DOM导出，无复杂优化，直接导出当前显示内容
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => simpleDomExport('png')}
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {exporting ? '导出中...' : '📷 PNG导出'}
          </Button>
          <Button
            onClick={() => simpleDomExport('jpeg')}
            disabled={exporting}
            variant="outline"
            size="sm"
          >
            {exporting ? '导出中...' : '📷 JPEG导出'}
          </Button>
        </div>

        {status && (
          <div className={`text-sm text-center p-2 rounded ${
            status.includes('✅') ? 'bg-green-50 text-green-700' :
            status.includes('❌') ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {status}
          </div>
        )}
        
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-semibold text-blue-700">📷 简单导出：</div>
          <div>• 直接使用dom-to-image导出</div>
          <div>• 固定350x500尺寸</div>
          <div>• 1倍像素比，避免复杂问题</div>
          <div>• 无额外优化，保持原始效果</div>
        </div>
      </div>
    </Card>
  )
}