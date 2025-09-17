'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { useAuthStore } from '@/store/auth'

interface DiagnosisExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function DiagnosisExport({ 
  cardRef, 
  className = '' 
}: DiagnosisExportProps) {
  const [exporting, setExporting] = useState(false)
  const [diagnosis, setDiagnosis] = useState<any>(null)
  
  const { user } = useAuthStore()

  // 🔍 全面诊断并显示所有信息
  const fullDiagnosis = async () => {
    if (!cardRef.current) {
      alert('名片组件未找到')
      return
    }

    setExporting(true)

    try {
      const element = cardRef.current
      
      // === 1. 基础信息收集 ===
      const basicInfo = {
        设备像素比: window.devicePixelRatio,
        浏览器: navigator.userAgent,
        屏幕分辨率: `${screen.width}×${screen.height}`,
        窗口尺寸: `${window.innerWidth}×${window.innerHeight}`,
        元素标签: element.tagName,
        元素ID: element.id || '无',
        元素类名: element.className || '无'
      }

      // === 2. 元素尺寸详细信息 ===
      const rect = element.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(element)
      
      const sizeInfo = {
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        boundingRect: {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top
        },
        computedStyle: {
          width: computedStyle.width,
          height: computedStyle.height,
          boxSizing: computedStyle.boxSizing,
          display: computedStyle.display,
          position: computedStyle.position
        }
      }

      // === 3. 样式信息 ===
      const styleInfo = {
        background: computedStyle.background,
        backgroundImage: computedStyle.backgroundImage,
        backgroundSize: computedStyle.backgroundSize,
        backgroundPosition: computedStyle.backgroundPosition,
        transform: computedStyle.transform,
        zoom: computedStyle.zoom,
        border: computedStyle.border,
        borderRadius: computedStyle.borderRadius,
        boxShadow: computedStyle.boxShadow,
        overflow: computedStyle.overflow
      }

      // === 4. 字体信息 ===
      const fontInfo = {
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight,
        lineHeight: computedStyle.lineHeight,
        color: computedStyle.color,
        textRendering: computedStyle.textRendering
      }

      // === 5. 子元素分析 ===
      const children = Array.from(element.children)
      const childrenInfo = children.map((child, index) => {
        const childStyle = window.getComputedStyle(child as HTMLElement)
        return {
          index,
          tagName: child.tagName,
          className: child.className || '无',
          width: childStyle.width,
          height: childStyle.height,
          position: childStyle.position,
          transform: childStyle.transform
        }
      })

      // === 6. 图片资源分析 ===
      const images = element.querySelectorAll('img')
      const imageInfo = Array.from(images).map((img, index) => ({
        index,
        src: img.src,
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        crossOrigin: img.crossOrigin || '无'
      }))

      // === 7. html2canvas测试 ===
      console.log('🔍 开始html2canvas基础测试...')
      
      const testCanvas1 = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true
      })

      const testCanvas2 = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true
      })

      const html2canvasInfo = {
        scale1结果: {
          width: testCanvas1.width,
          height: testCanvas1.height,
          expected: `${element.offsetWidth}×${element.offsetHeight}`
        },
        scale2结果: {
          width: testCanvas2.width,
          height: testCanvas2.height,
          expected: `${element.offsetWidth * 2}×${element.offsetHeight * 2}`
        }
      }

      // === 汇总诊断结果 ===
      const fullDiagnosisResult = {
        basicInfo,
        sizeInfo,
        styleInfo,
        fontInfo,
        childrenInfo,
        imageInfo,
        html2canvasInfo,
        timestamp: new Date().toLocaleString()
      }

      setDiagnosis(fullDiagnosisResult)
      
      // 输出到控制台
      console.log('🔍 完整诊断结果:', fullDiagnosisResult)

    } catch (error) {
      console.error('诊断失败:', error)
      alert('诊断失败: ' + error)
    } finally {
      setExporting(false)
    }
  }

  // 🎯 最简单的导出测试
  const simpleTest = async () => {
    if (!cardRef.current) {
      alert('名片组件未找到')
      return
    }

    setExporting(true)

    try {
      const element = cardRef.current
      
      console.log('🎯 最简单测试开始...')
      console.log('元素尺寸:', element.offsetWidth, 'x', element.offsetHeight)
      
      // 最基础的html2canvas调用
      const canvas = await html2canvas(element)
      
      console.log('画布尺寸:', canvas.width, 'x', canvas.height)
      console.log('是否匹配:', canvas.width === element.offsetWidth, canvas.height === element.offsetHeight)
      
      // 直接下载
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('转换失败'))
        }, 'image/png')
      })
      
      const filename = `${user?.name || 'test'}-simple.png`
      saveAs(blob, filename)
      
      console.log('✅ 最简单测试完成')
      alert(`简单测试完成！\n元素: ${element.offsetWidth}×${element.offsetHeight}\n画布: ${canvas.width}×${canvas.height}`)

    } catch (error) {
      console.error('简单测试失败:', error)
      alert('简单测试失败: ' + error)
    } finally {
      setExporting(false)
    }
  }

  // 🔧 强制清晰度测试
  const forceClearTest = async () => {
    if (!cardRef.current) {
      alert('名片组件未找到')
      return
    }

    setExporting(true)

    try {
      const element = cardRef.current
      
      // 创建一个全新的、绝对清晰的canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      // 固定尺寸，高分辨率
      canvas.width = 1000
      canvas.height = 1400
      
      // 绘制纯色背景
      ctx.fillStyle = '#667eea'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 绘制清晰的文字
      ctx.fillStyle = 'white'
      ctx.font = 'bold 60px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('测试文字', canvas.width / 2, 200)
      
      ctx.font = '40px Arial'
      ctx.fillText('Test Text', canvas.width / 2, 300)
      
      ctx.font = '30px Arial'
      ctx.fillText('如果这个文字清晰，说明不是canvas问题', canvas.width / 2, 400)
      
      // 绘制一些形状
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 3
      ctx.strokeRect(100, 500, 800, 200)
      
      // 转换并下载
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('转换失败'))
        }, 'image/png')
      })
      
      const filename = `${user?.name || 'test'}-clear-test.png`
      saveAs(blob, filename)
      
      console.log('✅ 清晰度测试完成')
      alert('清晰度测试完成！\n如果这个图片清晰，说明问题在DOM转换\n如果这个图片也糊，说明是浏览器或系统问题')

    } catch (error) {
      console.error('清晰度测试失败:', error)
      alert('清晰度测试失败: ' + error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card className={`p-4 ${className} border-2 border-yellow-500`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-yellow-700">🔍 问题诊断器</h3>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            找出根本问题
          </Badge>
        </div>
        
        <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
          <strong>目标：</strong>找出为什么用了这么多方法还是糊的根本原因
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={fullDiagnosis}
            disabled={exporting}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
            size="sm"
          >
            {exporting ? '诊断中...' : '🔍 完整诊断（查看控制台）'}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={simpleTest}
              disabled={exporting}
              variant="outline"
              size="sm"
            >
              {exporting ? '测试中...' : '🎯 最简单测试'}
            </Button>
            <Button
              onClick={forceClearTest}
              disabled={exporting}
              variant="outline"
              size="sm"
            >
              {exporting ? '测试中...' : '🔧 清晰度测试'}
            </Button>
          </div>
        </div>

        {diagnosis && (
          <div className="text-xs bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
            <div className="font-semibold mb-2">诊断结果摘要：</div>
            <div>设备像素比: {diagnosis.basicInfo?.设备像素比}</div>
            <div>元素尺寸: {diagnosis.sizeInfo?.offsetWidth}×{diagnosis.sizeInfo?.offsetHeight}</div>
            <div>计算样式尺寸: {diagnosis.sizeInfo?.computedStyle?.width}×{diagnosis.sizeInfo?.computedStyle?.height}</div>
            <div>背景图片: {diagnosis.styleInfo?.backgroundImage !== 'none' ? '有' : '无'}</div>
            <div>变换: {diagnosis.styleInfo?.transform !== 'none' ? diagnosis.styleInfo?.transform : '无'}</div>
            <div>详细信息请查看控制台</div>
          </div>
        )}
        
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-semibold text-yellow-700">🔍 诊断内容：</div>
          <div>• 设备和浏览器信息</div>
          <div>• 元素尺寸详细分析</div>
          <div>• CSS样式完整检查</div>
          <div>• 子元素和图片资源</div>
          <div>• html2canvas行为测试</div>
          <div>• 纯canvas清晰度对比</div>
          <div className="text-yellow-600 font-semibold">找出真正的问题所在！</div>
        </div>
      </div>
    </Card>
  )
}
