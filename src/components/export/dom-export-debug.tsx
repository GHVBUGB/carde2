'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { User } from '@/lib/types'
import { saveAs } from 'file-saver'
import domtoimage from 'dom-to-image-more'

interface DomExportDebugProps {
  user: User
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function DomExportDebug({ 
  user, 
  cardRef,
  className = '' 
}: DomExportDebugProps) {
  const [exporting, setExporting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')

  // 🎯 精确DOM导出 - 完全消除偏移和边框
  const exportWithPreciseDOM = async (format: 'png' | 'jpg' = 'png') => {
    setExporting(true)
    setDebugInfo('开始导出...')
    
    try {
      if (!cardRef.current) {
        throw new Error('名片引用不存在')
      }

      const width = 350
      const height = 500
      
      setDebugInfo('正在创建精确克隆...')

      // 获取原始元素的计算样式
      const originalStyles = window.getComputedStyle(cardRef.current)
      setDebugInfo(`原始尺寸: ${originalStyles.width} x ${originalStyles.height}`)

      // 创建完全独立的导出容器
      const exportContainer = document.createElement('div')
      exportContainer.style.cssText = `
        position: fixed !important;
        top: -10000px !important;
        left: -10000px !important;
        width: ${width}px !important;
        height: ${height}px !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        background: transparent !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
        z-index: -9999 !important;
      `
      
      // 深度克隆原始元素
      const clonedCard = cardRef.current.cloneNode(true) as HTMLElement
      
      // 应用精确的重置样式
      clonedCard.style.cssText = `
        position: relative !important;
        top: 0 !important;
        left: 0 !important;
        width: ${width}px !important;
        height: ${height}px !important;
        min-width: ${width}px !important;
        min-height: ${height}px !important;
        max-width: ${width}px !important;
        max-height: ${height}px !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        transform: none !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
      `
      
      // 移除所有可能导致偏移的类名
      const classesToRemove = [
        'border', 'border-2', 'border-gray-200', 'border-gray-300',
        'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl',
        'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl',
        'm-1', 'm-2', 'm-3', 'm-4', 'mt-1', 'mt-2', 'mt-3', 'mt-4',
        'p-1', 'p-2', 'p-3', 'p-4', 'pt-1', 'pt-2', 'pt-3', 'pt-4'
      ]
      
      classesToRemove.forEach(cls => {
        clonedCard.classList.remove(cls)
      })
      
      // 深度清理所有子元素
      const allDescendants = clonedCard.querySelectorAll('*')
      allDescendants.forEach((element: any) => {
        if (element.style) {
          // 只保留必要的样式，清除所有边距和边框
          const essentialStyles = {
            position: element.style.position || 'relative',
            display: element.style.display || '',
            color: element.style.color || '',
            fontSize: element.style.fontSize || '',
            fontWeight: element.style.fontWeight || '',
            fontFamily: element.style.fontFamily || '',
            textAlign: element.style.textAlign || '',
            backgroundColor: element.style.backgroundColor || '',
            backgroundImage: element.style.backgroundImage || '',
            backgroundSize: element.style.backgroundSize || '',
            backgroundPosition: element.style.backgroundPosition || '',
            backgroundRepeat: element.style.backgroundRepeat || '',
            borderRadius: element.style.borderRadius || '',
            objectFit: element.style.objectFit || '',
            objectPosition: element.style.objectPosition || ''
          }
          
          // 清空所有样式
          element.style.cssText = ''
          
          // 重新应用必要样式，并强制去除边距边框
          Object.entries(essentialStyles).forEach(([prop, value]) => {
            if (value) {
              element.style[prop as any] = value
            }
          })
          
          // 强制清除边距边框
          element.style.margin = '0'
          element.style.padding = element.tagName === 'IMG' ? '0' : element.style.padding || '0'
          element.style.border = 'none'
          element.style.outline = 'none'
          element.style.boxShadow = 'none'
        }
        
        // 移除类名
        if (element.classList) {
          classesToRemove.forEach(cls => {
            element.classList.remove(cls)
          })
        }
      })
      
      setDebugInfo('正在添加到DOM...')
      exportContainer.appendChild(clonedCard)
      document.body.appendChild(exportContainer)
      
      // 等待DOM更新和样式应用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setDebugInfo('正在执行DOM导出...')
      
      // 使用最简单的DOM-to-image配置
      const options = {
        width: width,
        height: height,
        quality: format === 'png' ? 1.0 : 0.9,
        bgcolor: '#ffffff',
        cacheBust: true,
        style: {
          margin: '0',
          padding: '0',
          border: 'none'
        }
      }

      let dataUrl: string
      
      if (format === 'png') {
        dataUrl = await domtoimage.toPng(clonedCard, options)
      } else {
        dataUrl = await domtoimage.toJpeg(clonedCard, options)
      }
      
      setDebugInfo('正在清理临时元素...')
      // 清理
      document.body.removeChild(exportContainer)
      
      // 转换并下载
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      const filename = `${user.name || 'business-card'}-精确dom.${format}`
      saveAs(blob, filename)
      
      setDebugInfo(`✅ 导出成功！文件大小: ${(blob.size / 1024).toFixed(1)}KB`)
      
    } catch (error: any) {
      console.error('精确DOM导出失败:', error)
      setDebugInfo(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
    }
  }

  // 🔍 样式检查工具
  const checkStyles = () => {
    if (!cardRef.current) return
    
    const element = cardRef.current
    const styles = window.getComputedStyle(element)
    
    const styleInfo = [
      `尺寸: ${styles.width} x ${styles.height}`,
      `位置: ${styles.position}`,
      `边距: ${styles.margin}`,
      `内边距: ${styles.padding}`,
      `边框: ${styles.border}`,
      `盒模型: ${styles.boxSizing}`,
      `阴影: ${styles.boxShadow}`,
      `变换: ${styles.transform}`,
      `类名: ${element.className}`
    ]
    
    setDebugInfo(styleInfo.join('\n'))
    console.log('元素样式信息:', styleInfo)
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">🔧 DOM导出调试工具</h3>
        </div>
        
        <div className="text-sm text-gray-600">
          专门用于解决DOM导出的偏移和边框问题
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            onClick={() => exportWithPreciseDOM('png')}
            disabled={exporting}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {exporting ? '导出中...' : '精确PNG'}
          </Button>
          <Button
            size="sm"
            onClick={() => exportWithPreciseDOM('jpg')}
            disabled={exporting}
            className="bg-green-500 hover:bg-green-600"
          >
            {exporting ? '导出中...' : '精确JPG'}
          </Button>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={checkStyles}
          className="w-full"
        >
          🔍 检查样式
        </Button>
        
        {debugInfo && (
          <div className="bg-gray-100 p-3 rounded text-xs font-mono whitespace-pre-wrap">
            {debugInfo}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          <strong>调试说明:</strong><br/>
          • 精确导出: 完全重置所有样式，消除偏移<br/>
          • 检查样式: 查看当前元素的计算样式<br/>
          • 深度清理: 移除所有可能的边框和边距
        </div>
      </div>
    </Card>
  )
}
