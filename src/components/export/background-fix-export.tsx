'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { useAuthStore } from '@/store/auth'

interface BackgroundFixExportProps {
  cardRef: React.RefObject<HTMLDivElement>
  className?: string
}

export default function BackgroundFixExport({ 
  cardRef, 
  className = '' 
}: BackgroundFixExportProps) {
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  
  const { user } = useAuthStore()

  // 🎯 背景修复导出：解决CSS背景图片问题
  const backgroundFixExport = async (format: 'png' | 'jpeg') => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在修复背景图片问题...')

    try {
      const element = cardRef.current
      
      // 获取当前的背景图片URL
      const computedStyle = window.getComputedStyle(element)
      const backgroundImage = computedStyle.backgroundImage
      let backgroundUrl = ''
      
      if (backgroundImage && backgroundImage !== 'none') {
        const match = backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/)
        if (match) {
          backgroundUrl = match[1]
          console.log('检测到背景图片:', backgroundUrl)
        }
      }
      
      setStatus('正在创建修复版本...')
      
      // 创建一个修复版本的容器
      const fixedContainer = document.createElement('div')
      fixedContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 350px;
        height: 500px;
        border-radius: 20px;
        overflow: hidden;
        background: white;
      `
      
      // 如果有背景图，先添加img元素
      if (backgroundUrl) {
        const backgroundImg = document.createElement('img')
        backgroundImg.src = backgroundUrl
        backgroundImg.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: 0;
        `
        fixedContainer.appendChild(backgroundImg)
        
        // 等待背景图片加载
        await new Promise((resolve, reject) => {
          backgroundImg.onload = resolve
          backgroundImg.onerror = () => {
            console.warn('背景图片加载失败，使用渐变背景')
            // 如果背景图片加载失败，使用渐变
            fixedContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            resolve(null)
          }
          setTimeout(() => {
            console.warn('背景图片加载超时')
            resolve(null)
          }, 5000)
        })
      } else {
        // 没有背景图，使用渐变
        fixedContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }
      
      // 复制原始内容
      const contentWrapper = document.createElement('div')
      contentWrapper.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 1;
      `
      contentWrapper.innerHTML = element.innerHTML
      fixedContainer.appendChild(contentWrapper)
      
      // 添加到页面
      document.body.appendChild(fixedContainer)
      
      setStatus('等待渲染完成...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setStatus('正在生成图片...')
      
      // 使用html2canvas截图
      const canvas = await html2canvas(fixedContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: true,
        width: 350,
        height: 500,
      })
      
      // 清理临时元素
      document.body.removeChild(fixedContainer)
      
      setStatus('正在处理文件...')
      
      // 转换为blob并下载
      const blob = await new Promise<Blob>((resolve, reject) => {
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
        const quality = format === 'png' ? 1.0 : 0.95
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('无法生成图片文件'))
          }
        }, mimeType, quality)
      })
      
      const filename = `${user?.name || 'business-card'}-background-fix.${format}`
      saveAs(blob, filename)

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      const dimensions = `${canvas.width}×${canvas.height}`
      setStatus(`✅ 背景修复导出成功！尺寸: ${dimensions}, 大小: ${fileSizeKB}KB`)

    } catch (error: any) {
      console.error('❌ 背景修复导出失败:', error)
      setStatus(`❌ 导出失败: ${error.message}`)
    } finally {
      setExporting(false)
      setTimeout(() => setStatus(''), 5000)
    }
  }

  // 🎯 强制img背景导出
  const forceImgBackgroundExport = async (format: 'png' | 'jpeg') => {
    if (!cardRef.current) {
      setStatus('❌ 名片组件未找到')
      return
    }

    setExporting(true)
    setStatus('正在强制切换为img背景...')

    try {
      const element = cardRef.current
      
      // 检查是否有useImgBackground的切换功能
      const switchButton = document.querySelector('[data-switch-background]') as HTMLButtonElement
      if (switchButton) {
        setStatus('正在切换背景模式...')
        switchButton.click()
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      setStatus('正在导出img背景版本...')
      
      // 直接对当前元素截图
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: true,
        width: 350,
        height: 500,
      })
      
      setStatus('正在处理文件...')
      
      // 转换为blob并下载
      const blob = await new Promise<Blob>((resolve, reject) => {
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
        const quality = format === 'png' ? 1.0 : 0.95
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('无法生成图片文件'))
          }
        }, mimeType, quality)
      })
      
      const filename = `${user?.name || 'business-card'}-img-background.${format}`
      saveAs(blob, filename)

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      const dimensions = `${canvas.width}×${canvas.height}`
      setStatus(`✅ img背景导出成功！尺寸: ${dimensions}, 大小: ${fileSizeKB}KB`)

    } catch (error: any) {
      console.error('❌ img背景导出失败:', error)
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
          <h3 className="text-lg font-semibold text-green-700">🔧 背景修复导出</h3>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            专治背景丢失
          </Badge>
        </div>

        {/* 说明文字 */}
        <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
          <strong>问题诊断：</strong>你的名片使用CSS背景图片，html2canvas无法正确处理。
        </div>

        {/* 导出按钮 */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => backgroundFixExport('png')}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              {exporting ? '修复中...' : '🔧 修复PNG'}
            </Button>
            <Button
              onClick={() => backgroundFixExport('jpeg')}
              disabled={exporting}
              variant="outline"
              size="sm"
            >
              {exporting ? '修复中...' : '🔧 修复JPEG'}
            </Button>
          </div>
          
          <Button
            onClick={() => forceImgBackgroundExport('png')}
            disabled={exporting}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {exporting ? '强制中...' : '💪 强制img背景导出'}
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

        {/* 技术说明 */}
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-semibold text-green-700">🔧 修复原理：</div>
          <div>• <strong>背景修复</strong>：将CSS背景转换为img元素</div>
          <div>• <strong>内容复制</strong>：完整复制所有文字和头像</div>
          <div>• <strong>强制模式</strong>：直接切换到img背景模式</div>
          <div className="text-green-600 font-semibold">专门解决你的背景丢失问题！</div>
        </div>
      </div>
    </Card>
  )
}
