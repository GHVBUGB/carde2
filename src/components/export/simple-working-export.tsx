'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { useAuthStore } from '@/store/auth'

interface SimpleWorkingExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function SimpleWorkingExport({ 
  cardRef, 
  className = '' 
}: SimpleWorkingExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  
  const { user } = useAuthStore()

  // 🎯 简单可靠的导出
  const simpleExport = async (highRes = false) => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在导出...')

    try {
      const element = cardRef.current
      
      // 🔍 详细诊断元素尺寸
      const rect = element.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(element)
      
      console.log('🔍 导出前诊断:')
      console.log('元素尺寸:', {
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        boundingRect: { width: rect.width, height: rect.height },
        computedStyle: { width: computedStyle.width, height: computedStyle.height }
      })
      
      // 等待一下确保渲染完成
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 🔥 关键修复：使用元素的实际尺寸
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        // 🔥 强制设置正确的尺寸
        width: element.offsetWidth,
        height: element.offsetHeight,
        // 🔥 根据需要设置缩放
        scale: highRes ? 2 : 1,
      })
      
      console.log('🔍 导出后结果:')
      console.log('画布尺寸:', { width: canvas.width, height: canvas.height })
      console.log('预期尺寸:', { width: element.offsetWidth, height: element.offsetHeight })
      
      // 转换为blob并下载
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('无法生成图片文件'))
          }
        }, 'image/png', 1.0)
      })
      
      const filename = `${user?.name || 'business-card'}-${highRes ? 'high' : 'normal'}.png`
      saveAs(blob, filename)

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      const dimensions = `${canvas.width}×${canvas.height}`
      setStatus(`✅ 导出成功！尺寸: ${dimensions}, 大小: ${fileSizeKB}KB`)

    } catch (error: any) {
      console.error('导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">📸 简单导出</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => simpleExport(false)}
            disabled={exporting}
            variant="outline"
            size="sm"
          >
            {exporting ? '导出中...' : '标准导出'}
          </Button>
          <Button
            onClick={() => simpleExport(true)}
            disabled={exporting}
            size="sm"
          >
            {exporting ? '导出中...' : '高清导出'}
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
          <div>• <strong>标准导出</strong>：1:1原尺寸，不压缩</div>
          <div>• <strong>高清导出</strong>：2倍分辨率，更清晰</div>
          <div>• <strong>查看控制台</strong>：详细尺寸诊断信息</div>
        </div>
      </div>
    </Card>
  )
}
