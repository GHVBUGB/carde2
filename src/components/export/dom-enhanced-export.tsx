'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import domtoimage from 'dom-to-image-more'
import { useAuthStore } from '@/store/auth'

interface DomEnhancedExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function DomEnhancedExport({ 
  cardRef, 
  className = '' 
}: DomEnhancedExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  
  const { user } = useAuthStore()

  // 🎯 增强版DOM导出（基于参考文章的方法）
  const enhancedDomExport = async (format: 'png' | 'jpeg' = 'png') => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在准备增强DOM导出...')

    try {
      const domNode = cardRef.current
      
      setStatus('第一步：获取设备像素比...')
      
      // 🔥 关键：获取设备像素比（参考文章核心）
      const ratio = window.devicePixelRatio || 1
      console.log('设备像素比:', ratio)
      
      setStatus('第二步：创建高分辨率配置...')
      
      // 🔥 使用设备像素比优化的配置
      const options = {
        width: domNode.offsetWidth,
        height: domNode.offsetHeight,
        quality: 1.0,
        bgcolor: '#ffffff',
        cacheBust: true,
        style: {
          margin: '0',
          padding: '0',
          border: 'none',
          transform: 'scale(1)', // 保持原始缩放
          transformOrigin: '0 0'
        },
        // 🔥 关键：自定义过滤器，确保高质量渲染
        filter: (node: HTMLElement) => {
          // 移除可能影响渲染的样式
          if (node.style) {
            node.style.boxShadow = 'none'
            node.style.filter = 'none'
          }
          return true
        }
      }
      
      setStatus('第三步：DOM基础导出...')
      
      // 先用dom-to-image生成基础图片
      let dataUrl: string
      if (format === 'png') {
        dataUrl = await domtoimage.toPng(domNode, options)
      } else {
        dataUrl = await domtoimage.toJpeg(domNode, options)
      }
      
      setStatus('第四步：应用像素比增强...')
      
      // 🔥 关键：创建增强版canvas（模拟文章中的draw方法修改）
      const image = new Image()
      image.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
        image.src = dataUrl
      })
      
      // 🔥 按照文章方法创建增强canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      
      // 设置原始尺寸
      canvas.width = domNode.offsetWidth
      canvas.height = domNode.offsetHeight
      
      // 🔥 应用设备像素比（文章核心方法）
      canvas.width *= ratio
      canvas.height *= ratio
      
      // 🔥 缩放上下文以匹配设备像素比
      context.scale(ratio, ratio)
      
      // 高质量渲染设置
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      
      // 🔥 绘制图像（对应文章中的drawImage）
      context.drawImage(image, 0, 0)
      
      setStatus('第五步：生成最终文件...')
      
      // 转换为blob并下载
      const blob = await new Promise<Blob>((resolve, reject) => {
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
        const quality = format === 'png' ? 1.0 : 0.95
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('无法生成增强图片'))
          }
        }, mimeType, quality)
      })
      
      const filename = `${user?.name || 'business-card'}-dom-enhanced.${format}`
      saveAs(blob, filename)

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      const originalSize = `${domNode.offsetWidth}×${domNode.offsetHeight}`
      const enhancedSize = `${canvas.width}×${canvas.height}`
      setStatus(`✅ 增强DOM导出成功！原始: ${originalSize}, 增强: ${enhancedSize}, 比例: ${ratio}x, 大小: ${fileSizeKB}KB`)

      console.log('✅ 增强DOM导出详情:', {
        设备像素比: ratio,
        原始尺寸: originalSize,
        增强尺寸: enhancedSize,
        文件大小: fileSizeKB + 'KB',
        方法: '基于参考文章的像素比增强'
      })

    } catch (error: any) {
      console.error('❌ 增强DOM导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 8000)
    }
  }

  // 🎯 自定义draw方法的完整实现
  const customDrawMethodExport = async (format: 'png' | 'jpeg' = 'png') => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在使用自定义draw方法...')

    try {
      const domNode = cardRef.current
      
      setStatus('第一步：准备DOM节点...')
      
      // 等待DOM稳定
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setStatus('第二步：获取设备信息...')
      
      const ratio = window.devicePixelRatio || 1
      
      setStatus('第三步：执行自定义DOM转换...')
      
      // 🔥 完全按照文章方法实现
      const customDomToImage = async (node: HTMLElement): Promise<HTMLCanvasElement> => {
        // 先用dom-to-image生成SVG
        const svgDataUrl = await domtoimage.toSvg(node, {
          width: node.offsetWidth,
          height: node.offsetHeight,
          bgcolor: '#ffffff',
          quality: 1.0
        })
        
        // 创建图片对象
        const image = new Image()
        image.crossOrigin = 'anonymous'
        
        await new Promise((resolve, reject) => {
          image.onload = resolve
          image.onerror = reject
          image.src = svgDataUrl
        })
        
        // 🔥 实现文章中的draw方法修改
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        
        // 设置基础尺寸
        canvas.width = node.offsetWidth
        canvas.height = node.offsetHeight
        
        // 🔥 应用像素比（文章核心）
        canvas.width *= ratio
        canvas.height *= ratio
        context.scale(ratio, ratio)
        
        // 高质量设置
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
        
        // 绘制
        context.drawImage(image, 0, 0)
        
        return canvas
      }
      
      setStatus('第四步：自定义draw方法处理...')
      
      const enhancedCanvas = await customDomToImage(domNode)
      
      setStatus('正在生成自定义方法文件...')
      
      // 转换为blob并下载
      const blob = await new Promise<Blob>((resolve, reject) => {
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
        const quality = format === 'png' ? 1.0 : 0.95
        
        enhancedCanvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('无法生成自定义方法图片'))
          }
        }, mimeType, quality)
      })
      
      const filename = `${user?.name || 'business-card'}-custom-draw.${format}`
      saveAs(blob, filename)

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      const dimensions = `${enhancedCanvas.width}×${enhancedCanvas.height}`
      setStatus(`✅ 自定义draw方法成功！尺寸: ${dimensions}, 比例: ${ratio}x, 大小: ${fileSizeKB}KB`)

    } catch (error: any) {
      console.error('❌ 自定义draw方法失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 5000)
    }
  }

  return (
    <Card className={`p-4 ${className} border-2 border-green-500`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-700">🔧 DOM增强导出</h3>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            基于CSDN文章方法
          </Badge>
        </div>
        
        <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
          <strong>原理：</strong>利用devicePixelRatio解决像素偏差，修改draw方法确保图像清晰
        </div>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => enhancedDomExport('png')}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              {exporting ? '增强中...' : '🔧 增强PNG'}
            </Button>
            <Button
              onClick={() => enhancedDomExport('jpeg')}
              disabled={exporting}
              variant="outline"
              size="sm"
            >
              {exporting ? '增强中...' : '🔧 增强JPEG'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => customDrawMethodExport('png')}
              disabled={exporting}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              {exporting ? 'Draw中...' : '🎨 自定义Draw PNG'}
            </Button>
            <Button
              onClick={() => customDrawMethodExport('jpeg')}
              disabled={exporting}
              variant="outline"
              size="sm"
            >
              {exporting ? 'Draw中...' : '🎨 自定义Draw JPEG'}
            </Button>
          </div>
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
          <div className="font-semibold text-green-700">🔧 CSDN文章方法：</div>
          <div>• <strong>devicePixelRatio</strong>：获取设备像素比</div>
          <div>• <strong>canvas.width *= ratio</strong>：放大画布真实尺寸</div>
          <div>• <strong>context.scale(ratio, ratio)</strong>：缩放上下文</div>
          <div>• <strong>drawImage优化</strong>：解决像素偏差问题</div>
          <div>• <strong>自定义draw方法</strong>：完全按文章实现</div>
          <div className="text-green-600 font-semibold">解决DOM模糊的根本方案！</div>
        </div>
      </div>
    </Card>
  )
}
