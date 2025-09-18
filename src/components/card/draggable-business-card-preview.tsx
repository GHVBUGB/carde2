'use client'

import { User } from '@/lib/types'
import { useState, useRef, useEffect } from 'react'
import { useCardStore } from '@/store/card'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { toPng as domToPng, toJpeg as domToJpeg } from 'html-to-image'
import { generateOptimizedSVG, svgToHighQualityImage } from '@/utils/svg-export-optimized'
import DomExportDebug from '@/components/export/dom-export-debug'
import FixedSizeExport from '@/components/export/fixed-size-export'
import EnhancedDomExport from '@/components/export/enhanced-dom-export'
import DomEnhancedExport from '@/components/export/dom-enhanced-export'
import DiagnosisExport from '@/components/export/diagnosis-export'
import ForceFixExport from '@/components/export/force-fix-export'
import LayoutPerfectExport from '@/components/export/layout-perfect-export'
import BypassDomExport from '@/components/export/bypass-dom-export'

interface TextModules {
  companyName: string
  name: string
  title: string
  studentsServed: number
  positiveRating: number
  phone: string
  teacherSelectionLabel: string
  progressFeedbackLabel: string
  planningLabel: string
  resourceSharingLabel: string
}

interface TextStyles {
  companyName: { fontSize: number; color: string; fontWeight: string }
  name: { fontSize: number; color: string; fontWeight: string }
  title: { fontSize: number; color: string; fontWeight: string }
  studentsServed: { fontSize: number; color: string; fontWeight: string }
  positiveRating: { fontSize: number; color: string; fontWeight: string }
  phone: { fontSize: number; color: string; fontWeight: string }
  teacherSelectionLabel: { fontSize: number; color: string; fontWeight: string }
  progressFeedbackLabel: { fontSize: number; color: string; fontWeight: string }
  planningLabel: { fontSize: number; color: string; fontWeight: string }
  resourceSharingLabel: { fontSize: number; color: string; fontWeight: string }
}

interface TextPositions {
  companyName: { x: number; y: number }
  name: { x: number; y: number }
  title: { x: number; y: number }
  studentsServed: { x: number; y: number }
  positiveRating: { x: number; y: number }
  phone: { x: number; y: number }
  teacherSelectionLabel: { x: number; y: number }
  progressFeedbackLabel: { x: number; y: number }
  planningLabel: { x: number; y: number }
  resourceSharingLabel: { x: number; y: number }
}

interface DraggableBusinessCardPreviewProps {
  user: User
  avatarConfig: {
    size: number
    position: { x: number; y: number }
  }
  textModules: TextModules
  textStyles: TextStyles
  textPositions: TextPositions
  logoConfig?: {
    enabled: boolean
    src: string
    size: { width: number; height: number }
    position: { x: number; y: number }
  }
  abilities: {
    teacherScreening: boolean
    feedbackAbility: boolean
    planningAbility: boolean
    resourceSharing: boolean
  }
  className?: string
  backgroundImage?: string
  onBackgroundUpload?: (file: File) => void
  onPositionChange?: (moduleId: string, x: number, y: number) => void
  onAvatarPositionChange?: (x: number, y: number) => void
  onLogoPositionChange?: (x: number, y: number) => void
  cardRef?: React.RefObject<HTMLDivElement>
}

export default function DraggableBusinessCardPreview({ 
  user, 
  avatarConfig,
  textModules,
  textStyles,
  textPositions,
  logoConfig,
  abilities,
  className, 
  backgroundImage = '/ditu.png',
  onBackgroundUpload,
  onPositionChange,
  onAvatarPositionChange,
  onLogoPositionChange,
  cardRef: externalCardRef
}: DraggableBusinessCardPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const internalCardRef = useRef<HTMLDivElement>(null)
  const cardRef = externalCardRef || internalCardRef
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showCoordinates, setShowCoordinates] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [useImgBackground, setUseImgBackground] = useState(false)  // 控制是否使用img背景
  
  // 🎯 背景图片样式计算 - 解决html2canvas不支持object-fit的问题
  const [backgroundImageStyle, setBackgroundImageStyle] = useState({
    position: 'absolute' as const,
    width: '350px',
    height: '500px',
    left: '0',
    top: '0',
    objectFit: 'cover' as const,  // 添加默认的cover效果
    objectPosition: 'center' as const,
    zIndex: 0
  })

  // 🎯 计算背景图片尺寸 - 模拟object-fit: cover效果
  const calculateBackgroundImageDimensions = (imageSrc: string) => {
    const container = { width: 350, height: 500 }
    const img = new Image()
    img.src = imageSrc
    
    img.onload = () => {
      const imgRatio = img.naturalWidth / img.naturalHeight
      const containerRatio = container.width / container.height
      
      let width, height, left, top
      
      if (imgRatio > containerRatio) {
        // 图片更宽，以高度为准（类似object-fit: cover的行为）
        height = container.height
        width = height * imgRatio
        top = 0
        left = (container.width - width) / 2
      } else {
        // 图片更高，以宽度为准
        width = container.width
        height = width / imgRatio
        left = 0
        top = (container.height - height) / 2
      }
      
      setBackgroundImageStyle({
        position: 'absolute',
        width: width + 'px',
        height: height + 'px',
        left: left + 'px',
        top: top + 'px',
        objectFit: 'cover',  // 保留CSS object-fit作为备选
        objectPosition: 'center',
        zIndex: 0
      })
      
      console.log('🎯 背景图片尺寸计算完成:', {
        original: `${img.naturalWidth}x${img.naturalHeight}`,
        calculated: `${width}x${height}`,
        position: `${left}, ${top}`,
        imgRatio: imgRatio.toFixed(3),
        containerRatio: containerRatio.toFixed(3)
      })
    }
    
    img.onerror = () => {
      console.warn('❌ 背景图片加载失败，使用默认尺寸')
      setBackgroundImageStyle({
        position: 'absolute',
        width: '350px',
        height: '500px',
        left: '0',
        top: '0',
        objectFit: 'cover',
        objectPosition: 'center',
        zIndex: 0
      })
    }
  }

  // 处理背景图上传
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onBackgroundUpload) {
      onBackgroundUpload(file)
    }
  }

  // 🎯 当背景图片改变时重新计算尺寸
  useEffect(() => {
    if (backgroundImage) {
      calculateBackgroundImageDimensions(backgroundImage)
    }
  }, [backgroundImage])

  // 🎯 监听导出事件，切换背景模式
  useEffect(() => {
    const handleSwitchBackground = () => {
      console.log('🔄 切换到img背景模式用于导出')
      setUseImgBackground(true)
      // 等待一段时间确保背景切换完成
      setTimeout(() => {
        if (backgroundImage) {
          calculateBackgroundImageDimensions(backgroundImage)
        }
      }, 100)
    }

    const handleResetBackground = () => {
      console.log('🔄 恢复CSS背景模式')
      setUseImgBackground(false)
    }

    if (cardRef && cardRef.current) {
      const element = cardRef.current
      element.addEventListener('switchToImgBackground', handleSwitchBackground)
      element.addEventListener('resetBackground', handleResetBackground)
      
      return () => {
        element.removeEventListener('switchToImgBackground', handleSwitchBackground)
        element.removeEventListener('resetBackground', handleResetBackground)
      }
    }
  }, [cardRef, backgroundImage])

  // 🔍 完整诊断功能
  const fullDiagnosis = async () => {
    console.log('=== 开始全面诊断 ===');
    
    // 1. 基础信息
    console.log('设备像素比:', window.devicePixelRatio);
    console.log('窗口尺寸:', window.innerWidth, 'x', window.innerHeight);
    console.log('页面缩放:', window.outerWidth / window.innerWidth);
    
    // 2. 容器信息
    const container = cardRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const computed = window.getComputedStyle(container);
    
    console.log('容器getBoundingClientRect:', rect);
    console.log('容器offsetWidth/Height:', container.offsetWidth, container.offsetHeight);
    console.log('容器clientWidth/Height:', container.clientWidth, container.clientHeight);
    console.log('容器computed width/height:', computed.width, computed.height);
    console.log('容器box-sizing:', computed.boxSizing);
    
    // 3. 图片信息
    const imgs = container.querySelectorAll('img');
    imgs.forEach((img, index) => {
      console.log(`图片${index}:`, {
        src: img.src.substring(0, 50) + '...',
        naturalSize: `${img.naturalWidth}x${img.naturalHeight}`,
        displaySize: `${img.offsetWidth}x${img.offsetHeight}`,
        objectFit: window.getComputedStyle(img).objectFit,
        crossOrigin: img.crossOrigin,
        complete: img.complete
      });
    });
    
    // 4. 字体加载状态
    console.log('字体加载状态:', document.fonts.status);
    
    // 5. Canvas能力检测
    const testCanvas = document.createElement('canvas');
    const ctx = testCanvas.getContext('2d');
    console.log('Canvas最大尺寸:', ctx?.canvas.width, ctx?.canvas.height);
    
    console.log('=== 诊断完成 ===');
  }

  // 🎯 新img元素导出 - 基于我们的img背景元素结构的全新导出方法
  const handleImgBasedExport = async (format: 'png' | 'jpg' = 'png') => {
    try {
      if (!cardRef.current) {
        alert('未找到名片元素')
        return
      }

      setExporting(true)
      console.log('🎯 开始新img元素导出')

      // 1. 切换到img背景模式
      setUseImgBackground(true)
      await new Promise(resolve => setTimeout(resolve, 100)) // 等待状态更新

      // 2. 暂时隐藏坐标显示
      const prevShowCoordinates = showCoordinates
      if (showCoordinates) setShowCoordinates(false)

      // 2. 等待资源准备
      await new Promise(resolve => setTimeout(resolve, 500))
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      // 3. 验证背景图片是否已加载
      const cardElement = cardRef.current
      const backgroundImg = cardElement.querySelector('[alt="名片背景"]') as HTMLImageElement
      
      if (!backgroundImg || !backgroundImg.complete) {
        console.warn('⚠️ 背景图片未完全加载，等待加载...')
        await new Promise((resolve) => {
          if (backgroundImg) {
            backgroundImg.onload = () => resolve(void 0)
            if (backgroundImg.complete) resolve(void 0)
          } else {
            resolve(void 0)
          }
        })
      }

      console.log('🎯 背景图片信息:', {
        src: backgroundImg?.src?.substring(0, 50) + '...',
        natural: `${backgroundImg?.naturalWidth}x${backgroundImg?.naturalHeight}`,
        display: `${backgroundImg?.offsetWidth}x${backgroundImg?.offsetHeight}`,
        style: `${backgroundImg?.style.width} x ${backgroundImg?.style.height}`,
        complete: backgroundImg?.complete
      })

      // 4. 【全新方法】直接截图名片容器，强制350x500尺寸
      const targetScale = format === 'png' ? 2.5 : 2
      
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        logging: true,
        scale: targetScale,
        width: 350,                      // 强制350宽度
        height: 500,                     // 强制500高度
        foreignObjectRendering: false,
        imageTimeout: 30000,             // 30秒超时
        removeContainer: false,
        onclone: (clonedDoc, clonedElement) => {
          console.log('🎯 onclone 回调开始')
          
          if (clonedElement && clonedElement instanceof HTMLElement) {
            // 重置容器样式
            clonedElement.style.position = 'relative'
            clonedElement.style.left = '0'
            clonedElement.style.top = '0'
            clonedElement.style.margin = '0'
            clonedElement.style.padding = '0'
            clonedElement.style.width = '350px'
            clonedElement.style.height = '500px'
            clonedElement.style.minWidth = '350px'
            clonedElement.style.minHeight = '500px'
            clonedElement.style.maxWidth = '350px'
            clonedElement.style.maxHeight = '500px'
            clonedElement.style.overflow = 'hidden'
            clonedElement.style.transform = 'none'
            clonedElement.style.zoom = '1'
            clonedElement.style.filter = 'none'
            
            // 检查背景图片
            const clonedBackgroundImg = clonedElement.querySelector('[alt="名片背景"]') as HTMLImageElement
            if (clonedBackgroundImg) {
              console.log('✅ 找到克隆的背景图片:', {
                src: clonedBackgroundImg.src.substring(0, 50) + '...',
                width: clonedBackgroundImg.style.width,
                height: clonedBackgroundImg.style.height,
                position: clonedBackgroundImg.style.position
              })
              
              // 确保背景图片在最底层
              clonedBackgroundImg.style.zIndex = '0'
              clonedBackgroundImg.style.position = 'absolute'
            } else {
              console.warn('❌ 未找到克隆的背景图片元素')
            }
            
            // 确保所有文字元素在上层
            const textElements = clonedElement.querySelectorAll('[data-module-id]')
            textElements.forEach((el) => {
              if (el instanceof HTMLElement) {
                el.style.zIndex = '10'
              }
            })
            
            console.log('🎯 克隆元素样式设置完成')
          }
        }
      })

      console.log('✅ 新方法Canvas尺寸:', canvas.width, 'x', canvas.height)
      
      // 5. 验证比例
      const actualRatio = canvas.width / canvas.height
      const expectedRatio = 350 / 500
      const ratioDiff = Math.abs(actualRatio - expectedRatio)
      
      console.log('✅ 比例检查:', {
        actual: actualRatio.toFixed(3),
        expected: expectedRatio.toFixed(3),
        diff: ratioDiff.toFixed(3),
        status: ratioDiff < 0.05 ? 'OK' : 'WARNING'
      })

      // 6. 导出
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('生成图片失败'))
          }
        }, format === 'png' ? 'image/png' : 'image/jpeg', format === 'jpg' ? 0.95 : undefined)
      })

      const filename = `${user?.name || 'business-card'}-新img导出.${format}`
      saveAs(blob, filename)

      if (prevShowCoordinates) setShowCoordinates(true)

      alert(`✅ 新img元素导出成功！\n格式: ${format.toUpperCase()}\n尺寸: ${canvas.width}x${canvas.height}\n比例: ${actualRatio.toFixed(3)} (预期: ${expectedRatio.toFixed(3)})\n状态: ${ratioDiff < 0.05 ? '比例正常' : '⚠️ 比例异常'}\n方法: 基于img元素，直接截图`)

    } catch (error: any) {
      console.error('❌ 新img导出失败:', error)
      alert('导出失败: ' + (error?.message || '未知错误'))
    } finally {
      // 恢复CSS背景预览模式
      setUseImgBackground(false)
      setExporting(false)
    }
  }

  // 🎯 裁剪截图导出 - 按照原图边框进行精确裁剪
  const handleCropExport = async (format: 'png' | 'jpg' = 'png') => {
    try {
      if (!cardRef.current) {
        alert('未找到名片元素')
        return
      }

      setExporting(true)
      console.log('🎯 开始裁剪截图导出')

      // 1. 暂时隐藏坐标显示
      const prevShowCoordinates = showCoordinates
      if (showCoordinates) setShowCoordinates(false)

      // 2. 等待资源准备
      await new Promise(resolve => setTimeout(resolve, 300))
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      // 3. 获取卡片在页面中的精确位置
      const cardElement = cardRef.current
      const rect = cardElement.getBoundingClientRect()
      
      console.log('🎯 卡片在页面中的位置:', {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      })

      // 4. 【终极修复】直接对名片容器截图，确保使用我们的img元素结构
      const targetScale = format === 'png' ? 2.5 : 2  // 更高分辨率
      
      // 🔥 直接截图名片容器，而不是整个页面裁剪
      const pageCanvas = await html2canvas(cardElement, {
        backgroundColor: '#ffffff',      // 确保白色背景  
        useCORS: true,
        allowTaint: false,
        logging: true,                   // 开启日志查看处理过程
        scale: targetScale,              // 高分辨率
        width: 350,                      // 强制指定宽度
        height: 500,                     // 强制指定高度
        foreignObjectRendering: false,   // 禁用可能导致变形的外部对象渲染
        imageTimeout: 15000,            // 更长的超时时间确保图片加载
        removeContainer: false,         // 保持容器结构
        onclone: (clonedDoc, element) => {
          // 🎯 确保克隆的名片容器样式正确
          if (element && element instanceof HTMLElement) {
            element.style.transform = 'none'
            element.style.position = 'relative'
            element.style.left = '0'
            element.style.top = '0'
            element.style.margin = '0'
            element.style.padding = '0'
            element.style.width = '350px'
            element.style.height = '500px'
            element.style.overflow = 'hidden'
            element.style.borderRadius = '16px'
            
            console.log('🎯 克隆元素样式设置完成')
          }
          
          // 🎯 检查背景图片元素
          const backgroundImg = clonedDoc.querySelector('[alt="名片背景"]') as HTMLImageElement
          if (backgroundImg) {
            console.log('✅ 找到背景图片元素:', {
              src: backgroundImg.src.substring(0, 50) + '...',
              width: backgroundImg.style.width,
              height: backgroundImg.style.height,
              position: backgroundImg.style.position,
              left: backgroundImg.style.left,
              top: backgroundImg.style.top
            })
            
            // 确保背景图片样式正确
            backgroundImg.style.position = 'absolute'
            backgroundImg.style.zIndex = '0'
          } else {
            console.warn('❌ 未找到背景图片元素')
          }
        }
      })

      console.log('✅ 裁剪Canvas尺寸:', pageCanvas.width, 'x', pageCanvas.height)
      
      // 5. 验证比例是否正确（应该接近0.7，即350/500）
      const actualRatio = pageCanvas.width / pageCanvas.height
      const expectedRatio = 350 / 500
      const ratioDiff = Math.abs(actualRatio - expectedRatio)
      
      console.log('✅ 比例检查:', {
        actual: actualRatio.toFixed(3),
        expected: expectedRatio.toFixed(3),
        diff: ratioDiff.toFixed(3),
        status: ratioDiff < 0.05 ? 'OK' : 'WARNING'
      })
      
      if (ratioDiff > 0.05) {
        console.warn('⚠️ 检测到比例异常，可能发生了压缩变形')
      }

      // 6. 直接导出页面Canvas（已经是最终结果，无需二次处理）
      const blob = await new Promise<Blob>((resolve, reject) => {
        pageCanvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('生成图片失败'))
          }
        }, format === 'png' ? 'image/png' : 'image/jpeg', format === 'jpg' ? 0.95 : undefined)
      })

      // 7. 下载文件
      const filename = `${user.name || 'business-card'}-裁剪截图.${format}`
      saveAs(blob, filename)

      // 8. 恢复界面状态
      if (prevShowCoordinates) setShowCoordinates(true)

      alert(`✅ 防变形裁剪导出成功！\n格式: ${format.toUpperCase()}\n尺寸: ${pageCanvas.width}x${pageCanvas.height}\n比例: ${actualRatio.toFixed(3)} (预期: ${expectedRatio.toFixed(3)})\n状态: ${ratioDiff < 0.05 ? '比例正常' : '⚠️ 比例异常'}\n方法: 直接高质量裁剪，无二次处理`)

    } catch (error: any) {
      console.error('❌ 裁剪截图导出失败:', error)
      alert('导出失败: ' + (error?.message || '未知错误'))
    } finally {
      setExporting(false)
    }
  }

  // 🎯 保留其他方法
  const handlePerfectExport = async (format: 'png' | 'jpg' = 'png') => {
    try {
      if (!cardRef.current) {
        alert('未找到名片元素')
        return
      }

      setExporting(true)
      console.log('🎯 开始全新导出方法')

      // 1. 暂时隐藏坐标显示
      const prevShowCoordinates = showCoordinates
      if (showCoordinates) setShowCoordinates(false)

      // 2. 等待所有资源准备就绪
      await new Promise(resolve => setTimeout(resolve, 500))
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      // 3. 创建一个临时容器，确保尺寸完全正确
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'fixed'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      tempContainer.style.width = '350px'
      tempContainer.style.height = '500px'
      tempContainer.style.zIndex = '-1'
      document.body.appendChild(tempContainer)

      // 4. 克隆原始卡片到临时容器
      const originalCard = cardRef.current
      const clonedCard = originalCard.cloneNode(true) as HTMLElement
      
      // 强制设置克隆卡片的样式
      clonedCard.style.width = '350px'
      clonedCard.style.height = '500px'
      clonedCard.style.minWidth = '350px'
      clonedCard.style.minHeight = '500px'
      clonedCard.style.maxWidth = '350px'
      clonedCard.style.maxHeight = '500px'
      clonedCard.style.position = 'relative'
      clonedCard.style.display = 'block'
      clonedCard.style.margin = '0'
      clonedCard.style.padding = '0'
      clonedCard.style.border = 'none'
      clonedCard.style.boxSizing = 'border-box'
      
      tempContainer.appendChild(clonedCard)

      // 5. 等待克隆元素渲染
      await new Promise(resolve => setTimeout(resolve, 200))

      console.log('🎯 临时容器尺寸:', tempContainer.offsetWidth, 'x', tempContainer.offsetHeight)
      console.log('🎯 克隆卡片尺寸:', clonedCard.offsetWidth, 'x', clonedCard.offsetHeight)

      // 6. 使用简化的html2canvas配置
      const canvas = await html2canvas(clonedCard, {
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        logging: true,
        scale: format === 'png' ? 4 : 3,
        width: 350,
        height: 500
      })

      // 7. 清理临时容器
      document.body.removeChild(tempContainer)

      console.log('✅ 全新导出Canvas尺寸:', canvas.width, 'x', canvas.height)
      console.log('✅ 应该是:', 350 * (format === 'png' ? 2 : 1.5), 'x', 500 * (format === 'png' ? 2 : 1.5))

      // 8. 导出为blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('生成图片失败'))
          }
        }, format === 'png' ? 'image/png' : 'image/jpeg', 0.95)
      })

      // 9. 下载文件
      const filename = `${user.name || 'business-card'}-全新方法.${format}`
      saveAs(blob, filename)

      // 10. 恢复界面状态
      if (prevShowCoordinates) setShowCoordinates(true)

      alert(`✅ 全新方法导出成功！\n格式: ${format.toUpperCase()}\n尺寸: ${canvas.width}x${canvas.height}`)

    } catch (error: any) {
      console.error('❌ 全新方法导出失败:', error)
      alert('导出失败: ' + (error?.message || '未知错误'))
    } finally {
      setExporting(false)
    }
  }

  // 🎯 保留原有方法作为备用
  const handleSimpleExport = async (format: 'png' | 'jpg' = 'png') => {
    try {
      if (!cardRef.current) {
        alert('未找到名片元素')
        return
      }

      setExporting(true)

      // 1. 暂时隐藏坐标显示
      const prevShowCoordinates = showCoordinates
      if (showCoordinates) setShowCoordinates(false)

      // 2. 等待DOM更新和资源加载
      await new Promise(resolve => setTimeout(resolve, 300))
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      // 3. 重新设计的html2canvas调用，解决300x150问题
      console.log('🚀 开始html2canvas渲染，目标元素:', cardRef.current)
      console.log('🚀 元素尺寸:', cardRef.current.offsetWidth, 'x', cardRef.current.offsetHeight)
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        logging: true, // 开启日志查看详细信息
        
        // 🎯 移除可能冲突的参数，让html2canvas自动检测
        // width: 350,
        // height: 500,
        
        scale: format === 'png' ? 4 : 3,
        foreignObjectRendering: false,
        removeContainer: false,
        imageTimeout: 15000,
        
        // 🎯 添加更多配置确保正确渲染
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        
        onclone: (clonedDoc) => {
          // 🎯 确保克隆容器尺寸精确
          const clonedContainer = clonedDoc.querySelector('[data-card-ref="true"]') as HTMLElement
          if (clonedContainer) {
            // 强制设置精确的350x500尺寸
            clonedContainer.style.width = '350px'
            clonedContainer.style.height = '500px'
            clonedContainer.style.minWidth = '350px'
            clonedContainer.style.minHeight = '500px'
            clonedContainer.style.maxWidth = '350px'
            clonedContainer.style.maxHeight = '500px'
            clonedContainer.style.boxSizing = 'border-box'
            clonedContainer.style.position = 'relative'
            clonedContainer.style.display = 'block'
            clonedContainer.style.flexShrink = '0'
            clonedContainer.style.flexGrow = '0'
            clonedContainer.style.padding = '0'
            clonedContainer.style.border = 'none' // 确保无边框
            
            // 修复图片的object-fit
            const clonedImages = clonedContainer.querySelectorAll('img')
            clonedImages.forEach((img) => {
              img.style.objectFit = 'cover'
              img.style.objectPosition = 'center'
            })
            
            console.log('🔧 克隆容器尺寸修复完成: 350px x 500px')
          }
        }
      })

      console.log('✅ 简化导出成功:')
      console.log('  Canvas尺寸:', canvas.width, 'x', canvas.height)
      console.log('  比例:', (canvas.width / canvas.height).toFixed(2))

      // 4. 导出为blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('生成图片失败'))
          }
        }, format === 'png' ? 'image/png' : 'image/jpeg', 0.95)
      })

      // 5. 下载文件
      const filename = `${user.name || 'business-card'}-终极修复.${format}`
      saveAs(blob, filename)

      // 6. 恢复界面状态
      if (prevShowCoordinates) setShowCoordinates(true)

      alert(`✅ 终极修复导出成功！\n格式: ${format.toUpperCase()}\n尺寸: ${canvas.width}x${canvas.height}`)

    } catch (error: any) {
      console.error('❌ 导出失败:', error)
      alert('导出失败: ' + (error?.message || '未知错误'))
    } finally {
      setExporting(false)
    }
  }

  // 🎯 原有Canvas导出功能 - 保留备用
  const handleCanvasExport = async (format: 'png' | 'jpg' = 'png') => {
    console.log('=== 新Canvas导出功能开始 ===')
    
    if (!user) {
      alert('错误：用户信息缺失')
      return
    }

    setExporting(true)

    try {
      // 创建临时Canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('无法创建Canvas上下文')
      }

      // 🎯 获取实际卡片的尺寸，而不是固定值
      if (!cardRef.current) {
        throw new Error('卡片元素未找到')
      }
      const cardRect = cardRef.current.getBoundingClientRect()
      const actualWidth = Math.round(cardRect.width)
      const actualHeight = Math.round(cardRect.height)

      const scale = format === 'png' ? 3 : 2 // PNG用3倍分辨率，JPG用2倍
      
      // 设置Canvas尺寸使用实际卡片尺寸
      canvas.width = actualWidth * scale
      canvas.height = actualHeight * scale
      
      console.log(`🎯 使用实际卡片尺寸: ${actualWidth}x${actualHeight}, Canvas尺寸: ${canvas.width}x${canvas.height}`)
      
      // 设置高质量渲染
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // 1. 绘制白色背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 2. 绘制背景图
      if (backgroundImage) {
        await new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            try {
              // 🎯 计算cover效果的绘制参数，确保比例正确
              const imgAspectRatio = img.width / img.height
              const canvasAspectRatio = canvas.width / canvas.height
              
              let drawWidth = canvas.width
              let drawHeight = canvas.height
              let drawX = 0
              let drawY = 0

              if (imgAspectRatio > canvasAspectRatio) {
                // 图片更宽，以高度为准
                drawWidth = canvas.height * imgAspectRatio
                drawX = -(drawWidth - canvas.width) / 2
              } else {
                // 图片更高，以宽度为准
                drawHeight = canvas.width / imgAspectRatio
                drawY = -(drawHeight - canvas.height) / 2
              }

              ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
              resolve()
            } catch (error) {
              reject(error)
            }
          }
          img.onerror = () => reject(new Error('背景图加载失败'))
          img.src = backgroundImage
        })
      }
      
      // 3. 绘制头像（如果存在）
      if (user.avatar_url) {
        await new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            try {
              // 🎯 获取头像元素的实际DOM位置（直接使用 cardRef，避免未定义的局部变量）
              const avatarElement = cardRef.current?.querySelector('img[alt="Avatar"]') as HTMLElement
              if (!avatarElement) {
                resolve()
                return
              }
              
              const avatarRect = avatarElement.getBoundingClientRect()
              const cardRect = cardRef.current!.getBoundingClientRect()
              
              const avatarX = (avatarRect.left - cardRect.left) * scale
              const avatarY = (avatarRect.top - cardRect.top) * scale
              const avatarSize = Math.min(avatarRect.width, avatarRect.height) * scale
              const radius = avatarSize / 2
              const centerX = avatarX + radius
              const centerY = avatarY + radius

              // 保存状态
              ctx.save()

              // 创建圆形裁剪
              ctx.beginPath()
              ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
              ctx.clip()

              // 🎯 智能比例保持 - 防止头像变形
              const aspectRatio = img.width / img.height
              let drawWidth = avatarSize
              let drawHeight = avatarSize
              let drawX = avatarX
              let drawY = avatarY

              if (aspectRatio > 1) {
                // 宽图片：以高度为准，水平居中
                drawWidth = avatarSize * aspectRatio
                drawX = avatarX - (drawWidth - avatarSize) / 2
              } else {
                // 高图片：以宽度为准，垂直居中
                drawHeight = avatarSize / aspectRatio
                drawY = avatarY - (drawHeight - avatarSize) / 2
              }

              // 绘制头像
              ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
              
              // 恢复状态
              ctx.restore()

              // 绘制白色边框
              ctx.strokeStyle = '#ffffff'
              ctx.lineWidth = 4 * scale
              ctx.beginPath()
              ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
              ctx.stroke()

              resolve()
            } catch (error) {
              reject(error)
            }
          }
          img.onerror = () => reject(new Error('头像加载失败'))
          img.src = user.avatar_url || ''
        })
      }
      
      // 4. 绘制文字内容（使用预览容器的实际字体，避免与导出不一致）
      // 🎯 等待DOM完全渲染后再读取位置
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const cardElement = cardRef.current
      const inheritedFontFamily = cardElement 
        ? window.getComputedStyle(cardElement).fontFamily 
        : "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Helvetica Neue', Arial, 'PingFang SC','Hiragino Sans GB','Microsoft YaHei', sans-serif"

      // 🎯 获取DOM元素的实际渲染位置和样式
      const getElementActualPosition = (selector: string) => {
        const element = cardElement?.querySelector(selector) as HTMLElement
        if (!element) return null
        
        const rect = element.getBoundingClientRect()
        const cardRect = cardElement!.getBoundingClientRect()
        const computedStyle = window.getComputedStyle(element)
        
        // 获取变换矩阵以计算实际位置
        const transform = computedStyle.transform
        let actualX = rect.left - cardRect.left
        let actualY = rect.top - cardRect.top
        
        // 如果有变换，需要调整位置
        if (transform && transform !== 'none') {
          const matrix = new DOMMatrix(transform)
          actualX += matrix.m41
          actualY += matrix.m42
        }
        
        // 对于服务标签，需要特殊处理位置偏移
        if (selector.includes('Label')) {
          // 服务标签通常有额外的偏移，需要调整
          const parentElement = element.parentElement
          if (parentElement) {
            const parentRect = parentElement.getBoundingClientRect()
            const parentCardRect = cardElement!.getBoundingClientRect()
            actualX = parentRect.left - parentCardRect.left
            actualY = parentRect.top - parentCardRect.top
          }
        }
        
        return {
          x: actualX,
          y: actualY,
          width: rect.width,
          height: rect.height,
          textAlign: computedStyle.textAlign,
          fontSize: parseFloat(computedStyle.fontSize),
          fontWeight: computedStyle.fontWeight,
          color: computedStyle.color,
          lineHeight: parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.2
        }
      }

      const drawText = (text: string, x: number, y: number, fontSize: number, color: string, fontWeight: string = 'normal', align: 'left' | 'center' = 'left') => {
        ctx.save()
        ctx.font = `${fontWeight} ${fontSize * scale}px ${inheritedFontFamily}`
        ctx.fillStyle = color
        ctx.textAlign = align
        ctx.textBaseline = 'top'  // 统一使用top基线
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = 1 * scale
        ctx.shadowOffsetY = 1 * scale
        ctx.fillText(text, x * scale, y * scale)
        ctx.restore()
      }

      const drawMultilineText = (text: string, x: number, y: number, fontSize: number, color: string, lineHeight = 1.2, align: 'left' | 'center' = 'left') => {
        const lines = text.split('\n')
        const startY = y
        
        lines.forEach((line, index) => {
          const lineY = startY + (index * fontSize * lineHeight)
          drawText(line, x, lineY, fontSize, color, 'normal', align)
        })
      }

      // 🎯 直接读取DOM中实际显示的文字内容，确保100%一致！
      
      // 获取预览卡片中实际显示的文字
      const getActualDisplayText = () => {
        const cardElement = cardRef.current
        if (!cardElement) return null

        const result = {
          name: '',
          title: '',
          studentsText: '',
          positiveText: '',
          phone: '',
          abilities: [] as Array<{text: string, x: number, y: number}>
        }

        // 从DOM中读取实际显示的文字内容
        try {
          // 查找姓名元素：通过 data-module-id 精确定位
          const nameElements = cardElement.querySelectorAll('[data-module-id="name"]')
          nameElements.forEach(el => {
            const textContent = el.textContent?.trim()
            if (textContent && !textContent.includes('电话:') && !textContent.includes('%')) {
              result.name = textContent
            }
          })

          // 查找职位元素
          const titleElements = cardElement.querySelectorAll('[data-module-id="title"]')
          titleElements.forEach(el => {
            const textContent = el.textContent?.trim()
            if (textContent && !textContent.includes('电话:') && !textContent.includes('%')) {
              result.title = textContent
            }
          })

        } catch (e) {
          console.warn('读取DOM文字失败，使用数据源:', e)
        }

        return result
      }

      const actualText = getActualDisplayText()

      // 工具：读取 DOM 样式（字体大小/字重/颜色）
      const readStyle = (selector: string, fallback: { fontSize: number; color: string; fontWeight: string }) => {
        const el = cardElement?.querySelector(selector) as HTMLElement | null
        if (!el) return fallback
        const cs = window.getComputedStyle(el)
        const fontSize = parseFloat(cs.fontSize) || fallback.fontSize
        const fontWeight = cs.fontWeight || fallback.fontWeight
        const color = cs.color || fallback.color
        return { fontSize, color, fontWeight }
      }

      // 🎯 直接从DOM读取姓名的实际位置和样式
      const namePos = getElementActualPosition('[data-module-id="name"]')
      const displayName = actualText?.name || textModules.name || 'أحمد'
      if (namePos) {
      drawText(
        displayName,
          namePos.x, namePos.y,
          namePos.fontSize, namePos.color, namePos.fontWeight, namePos.textAlign as any
      )
      }

      // 🎯 直接从DOM读取职位头衔的实际位置和样式
      const titlePos = getElementActualPosition('[data-module-id="title"]')
      const displayTitle = actualText?.title || textModules.title || user.title || 'شريك النمو الرئيسي'
      if (titlePos) {
      drawText(
        displayTitle,
          titlePos.x, titlePos.y,
          titlePos.fontSize, titlePos.color, titlePos.fontWeight, titlePos.textAlign as any
        )
      }

      // 🎯 直接从DOM读取统计数据的实际位置和样式
      const studentsContainerPos = getElementActualPosition('[data-module-id="studentsServed"]')
      const studentsText = textModules.studentsServed >= 1000 
        ? `${Math.floor(textModules.studentsServed / 1000)}K+`
        : textModules.studentsServed.toString()

      if (studentsContainerPos) {
        // 获取数值元素的位置
        const studentsValuePos = getElementActualPosition('[data-module-id="studentsServed"] > div:first-child')
        if (studentsValuePos) {
      drawText(
        studentsText,
            studentsValuePos.x, studentsValuePos.y,
            studentsValuePos.fontSize, studentsValuePos.color, studentsValuePos.fontWeight, studentsValuePos.textAlign as any
      )
        }
        
        // 获取标签元素的位置
        const studentsLabelPos = getElementActualPosition('[data-module-id="studentsServed"] > div:last-child')
        if (studentsLabelPos) {
      drawText(
        'الطلاب المخدومون',
            studentsLabelPos.x, studentsLabelPos.y,
            studentsLabelPos.fontSize, studentsLabelPos.color, 'normal', studentsLabelPos.textAlign as any
      )
        }
      }

      // 🎯 直接从DOM读取正面评分的实际位置和样式
      const positiveContainerPos = getElementActualPosition('[data-module-id="positiveRating"]')
      const positiveText = `${textModules.positiveRating}%`
      
      if (positiveContainerPos) {
        // 获取数值元素的位置
        const positiveValuePos = getElementActualPosition('[data-module-id="positiveRating"] > div:first-child')
        if (positiveValuePos) {
      drawText(
        positiveText,
            positiveValuePos.x, positiveValuePos.y,
            positiveValuePos.fontSize, positiveValuePos.color, positiveValuePos.fontWeight, positiveValuePos.textAlign as any
      )
        }
        
        // 获取标签元素的位置
        const positiveLabelPos = getElementActualPosition('[data-module-id="positiveRating"] > div:last-child')
        if (positiveLabelPos) {
      drawText(
        'نسبة التقييم',
            positiveLabelPos.x, positiveLabelPos.y,
            positiveLabelPos.fontSize, positiveLabelPos.color, 'normal', positiveLabelPos.textAlign as any
          )
        }
      }

      // 🎯 直接从DOM读取业务能力标签的实际位置和样式
      const abilityLabels = [
        {
          selector: '[data-module-id="teacherSelectionLabel"]',
          text: textModules.teacherSelectionLabel || 'اختيار\nالمعلم'
        },
        {
          selector: '[data-module-id="progressFeedbackLabel"]',
          text: textModules.progressFeedbackLabel || 'تعليقات\nالتقدم'
        },
        {
          selector: '[data-module-id="planningLabel"]',
          text: textModules.planningLabel || 'خطة\nالدراسة'
        },
        {
          selector: '[data-module-id="resourceSharingLabel"]',
          text: textModules.resourceSharingLabel || 'موارد\nالتعلم'
        }
      ]

      abilityLabels.forEach(label => {
        const labelPos = getElementActualPosition(label.selector)
        if (labelPos) {
          // 对于服务标签，需要调整位置以确保正确对齐
          let adjustedX = labelPos.x
          let adjustedY = labelPos.y
          
          // 根据文本对齐方式调整位置
          if (labelPos.textAlign === 'center') {
            adjustedX = labelPos.x + labelPos.width / 2
          }
          
          // 调整Y位置以匹配DOM中的实际渲染位置
          adjustedY = labelPos.y + labelPos.fontSize * 0.2 // 微调垂直位置
          
          console.log(`🎯 服务标签 ${label.selector}:`, {
            original: { x: labelPos.x, y: labelPos.y },
            adjusted: { x: adjustedX, y: adjustedY },
            textAlign: labelPos.textAlign,
            fontSize: labelPos.fontSize
          })
          
          drawMultilineText(
            label.text,
            adjustedX, adjustedY,
            labelPos.fontSize, labelPos.color,
            labelPos.lineHeight / labelPos.fontSize,
            labelPos.textAlign as any
          )
        }
      })

      // 🎯 直接从DOM读取电话信息的实际位置和样式
      const phonePos = getElementActualPosition('[data-module-id="phone"]')
      if (phonePos) {
        const phoneValue = textModules.phone || user.phone || '050-XXXX-XXAB'
        // 使用双向控制字符，保证在RTL环境中冒号与数字不乱序
        // \u200F: RLM（右向标记）；\u00A0: 不换行空格；\u2068/\u2069: FSI/PDI（双向隔离）
        const phoneText = `\u200Fهاتف:\u00A0\u2068${phoneValue}\u2069`
        drawText(
          phoneText,
          phonePos.x, phonePos.y,
          phonePos.fontSize, phonePos.color, phonePos.fontWeight, phonePos.textAlign as any
        )
      }

      console.log('🔍 新导出调试信息:')
      console.log('头像位置:', { x: avatarConfig.position.x, y: avatarConfig.position.y, size: avatarConfig.size })
      console.log('🎯 DOM实际位置:')
      console.log('  姓名位置:', namePos)
      console.log('  职位位置:', titlePos)
      console.log('  学员数容器:', studentsContainerPos)
      console.log('  好评率容器:', positiveContainerPos)
      console.log('  电话位置:', phonePos)
      console.log('✨ 现在Canvas导出使用DOM实际位置和样式，应该与编辑页面完全一致!')
      console.log('Canvas绘制完成，开始导出...')

      // 🎯 高质量导出 - 避免压缩失败
      const blob = await new Promise<Blob>((resolve, reject) => {
        if (format === 'jpg') {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              // 备选方案：使用dataURL
              const dataURL = canvas.toDataURL('image/jpeg', 0.95)
              fetch(dataURL).then(res => res.blob()).then(resolve).catch(reject)
            }
          }, 'image/jpeg', 0.95)
        } else {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              // 备选方案：使用dataURL
              const dataURL = canvas.toDataURL('image/png')
              fetch(dataURL).then(res => res.blob()).then(resolve).catch(reject)
            }
          }, 'image/png')
        }
      })

      const filename = `${user.name || 'business-card'}-名片-Canvas导出.${format}`
      saveAs(blob, filename)
      
      console.log('✅ 新Canvas导出成功！')
      alert(`🎉 导出成功！\n格式: ${format.toUpperCase()}\n分辨率: ${actualWidth * scale}x${actualHeight * scale}\n特点: 零变形、高质量、精确位置`)

    } catch (error) {
      console.error('❌ 新Canvas导出失败:', error)
      alert('导出失败: ' + (error as Error).message)
    } finally {
      setExporting(false)
    }
  }

  // 所见即所得：对预览DOM直接截图导出
  const handleWysiwygExport = async (format: 'png' | 'jpg' = 'png') => {
    try {
      if (!cardRef.current) {
        alert('未找到预览区域')
        return
      }
      setExporting(true)
      // 关闭坐标显示，避免导出干扰
      const prevShow = showCoordinates
      if (prevShow) setShowCoordinates(false)

      const node = cardRef.current
      const rect = node.getBoundingClientRect()
      const scale = format === 'png' ? 3 : 2
      // 使用 html2canvas 截图，避免裁剪和偏移
      const canvas = await html2canvas(node, {
        scale,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        logging: false,
        onclone: (doc) => {
          const clone = doc.querySelector('[data-card-ref="true"]') as HTMLElement | null
          if (clone) {
            clone.style.transform = 'none'
            clone.style.margin = '0'
            clone.style.filter = 'none'
          }
        }
      })

      const blob: Blob | null = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), format === 'png' ? 'image/png' : 'image/jpeg', 0.95)
      })

      if (!blob) throw new Error('生成图片失败')
      saveAs(blob, `${user?.name || 'business-card'}-所见即所得.${format}`)

      if (prevShow) setShowCoordinates(true)
      alert('导出成功（所见即所得）！')
    } catch (e: any) {
      console.error('WYSIWYG导出失败:', e)
      alert('导出失败：' + (e?.message || '未知错误'))
    } finally {
      setExporting(false)
    }
  }

  // SVG导出方法（推荐）
  // 像素级所见即所得导出（完全还原编辑页）
  const handlePixelPerfectExport = async (format: 'png' | 'jpg' = 'png') => {
    try {
      if (!cardRef.current) {
        alert('未找到预览区域')
        return
      }

      setExporting(true)

      // 等待资源准备好
      await waitForResourcesLoaded()
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      const source = cardRef.current
      const rect = source.getBoundingClientRect()
      const width = Math.round(rect.width)
      const height = Math.round(rect.height)

      // 在隔离的 iframe 中渲染，避免全局样式影响
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.left = '-10000px'
      iframe.style.top = '0'
      iframe.style.width = `${width}px`
      iframe.style.height = `${height}px`
      iframe.style.visibility = 'hidden'
      document.body.appendChild(iframe)

      const idoc = iframe.contentDocument as Document
      idoc.open()
      idoc.write('<!doctype html><html><head><meta charset="utf-8"/></head><body style="margin:0; padding:0; background:#ffffff;"></body></html>')
      idoc.close()

      const root = idoc.createElement('div')
      root.setAttribute('data-card-ref', 'true')
      root.style.width = `${width}px`
      root.style.height = `${height}px`
      root.style.background = '#ffffff'
      root.style.boxSizing = 'border-box'
      idoc.body.appendChild(root)

      // 复制节点并内联关键样式
      const clone = source.cloneNode(true) as HTMLElement

      const INLINE_PROPS = [
        'position','left','top','right','bottom','transform','display','width','height','minWidth','minHeight','maxWidth','maxHeight','margin','marginTop','marginRight','marginBottom','marginLeft','padding','paddingTop','paddingRight','paddingBottom','paddingLeft','border','borderTop','borderRight','borderBottom','borderLeft','borderRadius','boxSizing','background','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','backgroundRepeat','objectFit','objectPosition','overflow','color','fontFamily','fontSize','fontWeight','fontStyle','letterSpacing','lineHeight','textAlign','textTransform','textDecoration','whiteSpace','wordBreak','textShadow','opacity','zIndex','filter','boxShadow'
      ] as const

      const inlineComputed = (src: Element, dst: HTMLElement) => {
        const cs = window.getComputedStyle(src as HTMLElement)
        INLINE_PROPS.forEach((prop) => {
          // @ts-ignore
          const v = cs[prop] as string | undefined
          if (v) {
            // @ts-ignore
            dst.style[prop] = v
          }
        })
        // 特殊修正
        if (dst.tagName === 'IMG') {
          dst.style.objectFit = dst.style.objectFit || 'cover'
          dst.style.objectPosition = dst.style.objectPosition || 'center'
          ;(dst as HTMLImageElement).crossOrigin = 'anonymous'
        }
        const srcKids = Array.from(src.children)
        const dstKids = Array.from(dst.children) as HTMLElement[]
        for (let i = 0; i < srcKids.length; i++) {
          inlineComputed(srcKids[i], dstKids[i])
        }
      }

      inlineComputed(source, clone)
      // 清除可能影响导出的动画/滤镜/变换
      clone.style.transform = 'none'
      clone.style.filter = 'none'
      root.appendChild(clone)

      // 等待一帧确保样式应用
      await new Promise((r) => setTimeout(r, 50))

      const dpr = Math.max(2, Math.ceil((window.devicePixelRatio || 1) * (format === 'png' ? 1.5 : 1)))

      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        scale: dpr,
        width,
        height,
        logging: false,
        foreignObjectRendering: false,
        removeContainer: true
      })

      const blob: Blob | null = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), format === 'png' ? 'image/png' : 'image/jpeg', 0.95)
      })

      if (!blob) throw new Error('生成图片失败')
      saveAs(blob, `${user?.name || 'business-card'}-像素级导出.${format}`)

      document.body.removeChild(iframe)
      alert('导出成功（像素级所见即所得）！')
    } catch (e: any) {
      console.error('像素级导出失败:', e)
      alert('导出失败：' + (e?.message || '未知错误'))
    } finally {
      setExporting(false)
    }
  }

  const handleSVGExport = async () => {
    console.log('=== SVG导出开始 ===')
    
    if (!user) {
      alert('错误：用户信息缺失')
      return
    }

    setExporting(true)
    
    try {
      console.log('生成优化SVG...')
      
      const svgContent = generateOptimizedSVG({
        user,
        avatarConfig,
        textModules,
        textStyles,
        textPositions,
        abilities,
        backgroundImage,
        scale: 2
      })
      
      console.log('SVG生成完成，长度:', svgContent.length)
      
      // 直接下载SVG
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
      saveAs(svgBlob, `${user.name || 'business-card'}-名片.svg`)
      alert('SVG导出成功！')
      
    } catch (error: any) {
      console.error('SVG导出失败:', error)
      alert('SVG导出失败: ' + (error?.message || '未知错误'))
    } finally {
      setExporting(false)
    }
  }

  // SVG转高质量PNG导出方法
  const handleSVGToPNGExport = async () => {
    console.log('=== SVG转PNG导出开始 ===')
    
    if (!user) {
      alert('错误：用户信息缺失')
      return
    }

    setExporting(true)
    
    try {
      console.log('生成SVG并转换为PNG...')
      
      const svgContent = generateOptimizedSVG({
        user,
        avatarConfig,
        textModules,
        textStyles,
        textPositions,
        abilities,
        backgroundImage,
        scale: 2
      })
      
      // 转换为高质量PNG
      const blob = await svgToHighQualityImage(svgContent, 350, 500)
      
      console.log('SVG转PNG完成，blob大小:', blob.size)
      
      saveAs(blob, `${user.name || 'business-card'}-名片.png`)
      alert('SVG转PNG导出成功！')
      
    } catch (error: any) {
      console.error('SVG转PNG导出失败:', error)
      alert('SVG转PNG导出失败: ' + (error?.message || '未知错误'))
    } finally {
      setExporting(false)
    }
  }

  // 异步资源加载等待函数
  const waitForResourcesLoaded = async (): Promise<void> => {
    return new Promise((resolve) => {
      let loadedCount = 0
      const totalChecks = 3
      
      // 1. 等待图片加载完成
      const images = cardRef.current?.querySelectorAll('img') || []
      if (images.length === 0) {
        loadedCount++
      } else {
        let loadedImages = 0
        images.forEach((img) => {
          if (img.complete) {
            loadedImages++
          } else {
            img.onload = () => {
              loadedImages++
              if (loadedImages === images.length) {
                loadedCount++
                checkComplete()
              }
            }
            img.onerror = () => {
              loadedImages++
              if (loadedImages === images.length) {
                loadedCount++
                checkComplete()
              }
            }
          }
        })
        if (loadedImages === images.length) {
          loadedCount++
        }
      }
      
      // 2. 等待字体加载完成
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          loadedCount++
          checkComplete()
        })
      } else {
        loadedCount++
      }
      
      // 3. 等待CSS动画和transition完成
      setTimeout(() => {
        loadedCount++
        checkComplete()
      }, 100)
      
      function checkComplete() {
        if (loadedCount >= totalChecks) {
          resolve()
        }
      }
    })
  }

  // DOM元素可见性检查函数
  const checkElementVisibility = (element: HTMLElement): { visible: boolean; issues: string[] } => {
    const issues: string[] = []
    
    // 检查display
    const computedStyle = window.getComputedStyle(element)
    if (computedStyle.display === 'none') {
      issues.push('元素display为none')
    }
    
    // 检查visibility
    if (computedStyle.visibility === 'hidden') {
      issues.push('元素visibility为hidden')
    }
    
    // 检查opacity
    if (computedStyle.opacity === '0') {
      issues.push('元素opacity为0')
    }
    
    // 检查尺寸
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      issues.push(`元素尺寸为0: ${rect.width}x${rect.height}`)
    }
    
    // 检查是否在视口内 - 放宽检查条件，只要元素有有效尺寸就允许导出
    if (rect.width === 0 && rect.height === 0) {
      issues.push('元素尺寸为0，无法导出')
    }
    
    return {
      visible: issues.length === 0,
      issues
    }
  }

  // 导出时机控制函数
  const waitForExportReady = async (): Promise<void> => {
    return new Promise((resolve) => {
      // 检查页面是否完全加载
      if (document.readyState === 'complete') {
        resolve()
        return
      }
      
      // 等待页面完全加载
      window.addEventListener('load', () => {
        resolve()
      }, { once: true })
      
      // 超时保护
      setTimeout(() => {
        console.warn('⚠️ 导出时机等待超时，继续执行')
        resolve()
      }, 5000)
    })
  }

  // 零压缩导出方法 - 完全修复版
  const handleZeroCompressionExport = async (format: 'png' | 'jpg' = 'png') => {
    console.log('=== 零压缩导出开始 ===')
    
    if (!cardRef.current || !user) {
      alert('错误：无法找到名片元素或用户信息缺失')
      return
    }

    // 导出时机控制
    await waitForExportReady()
    console.log('✅ 导出时机控制完成')

    // 确保元素在视口内 - 滚动到元素位置
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center', 
        inline: 'center' 
      })
      // 等待滚动完成
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // DOM元素可见性检查 - 放宽检查条件
    const visibilityCheck = checkElementVisibility(cardRef.current)
    if (!visibilityCheck.visible) {
      console.warn('DOM元素可见性检查警告:', visibilityCheck.issues)
      // 不阻止导出，只记录警告
      console.log('⚠️ 继续执行导出，忽略可见性警告')
    } else {
      console.log('✅ DOM元素可见性检查通过')
    }

    // 目标元素选择器准确性验证
    const validateElementSelector = (): boolean => {
      const cardElement = cardRef.current
      if (!cardElement) {
        console.error('❌ 无法找到cardRef.current')
        return false
      }
      
      // 检查元素是否有正确的标识
      if (!cardElement.hasAttribute('data-card-ref')) {
        console.error('❌ 元素缺少data-card-ref属性')
        return false
      }
      
      // 检查DOM结构是否完整
      const requiredElements = [
        'img[alt="Avatar"]', // 头像
        'h1', // 姓名
        'p' // 职位
      ]
      
      for (const selector of requiredElements) {
        const element = cardElement.querySelector(selector)
        if (!element) {
          console.warn(`⚠️ 缺少必要元素: ${selector}`)
        }
      }
      
      console.log('✅ 目标元素选择器验证通过')
      return true
    }

    if (!validateElementSelector()) {
      alert('导出失败：目标元素选择器验证失败')
      return
    }

    setExporting(true)
    
    try {
      // 等待异步资源加载完成
      await waitForResourcesLoaded()
      console.log('✅ 异步资源加载完成')

      // 获取原始元素的实际尺寸
      const originalCard = cardRef.current
      const rect = originalCard.getBoundingClientRect()
      console.log('原始元素尺寸:', rect.width, 'x', rect.height)
      
      // 详细的调试输出
      console.log('=== 调试信息 ===')
      console.log('元素位置:', { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom })
      console.log('元素样式:', {
        display: window.getComputedStyle(originalCard).display,
        visibility: window.getComputedStyle(originalCard).visibility,
        opacity: window.getComputedStyle(originalCard).opacity,
        transform: window.getComputedStyle(originalCard).transform
      })
      console.log('子元素数量:', originalCard.children.length)
      console.log('图片元素数量:', originalCard.querySelectorAll('img').length)
      
      // 创建高分辨率副本，保持原始宽高比
      const clonedCard = originalCard.cloneNode(true) as HTMLElement
      
      // 设置克隆卡片的样式 - 确保可见和正确渲染
      clonedCard.style.position = 'absolute'
      clonedCard.style.left = '0'
      clonedCard.style.top = '0'
      clonedCard.style.width = '350px'
      clonedCard.style.height = '500px'
      clonedCard.style.transform = 'none !important'
      clonedCard.style.zoom = '1 !important'
      clonedCard.style.backgroundSize = 'cover'
      clonedCard.style.backgroundPosition = 'center'
      clonedCard.style.backgroundRepeat = 'no-repeat'
      clonedCard.style.borderRadius = '16px'
      clonedCard.style.overflow = 'hidden'
      clonedCard.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      clonedCard.style.backgroundColor = '#ffffff' // 确保有背景色
      clonedCard.style.visibility = 'visible'
      clonedCard.style.display = 'block'
      clonedCard.style.opacity = '1'
      
      // 移除所有子元素的变换，但保持位置，并应用object-fit防止变形
      const allElements = clonedCard.querySelectorAll('*')
      allElements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement
        // 只移除变换，保持其他样式
        if (htmlEl.style.transform && htmlEl.style.transform !== 'none') {
          htmlEl.style.transform = 'none !important'
        }
        htmlEl.style.zoom = '1 !important'
        htmlEl.style.scale = 'none !important'
        
        // 对图片元素应用object-fit防止变形
        if (htmlEl.tagName === 'IMG') {
          htmlEl.style.objectFit = 'cover' // 保持比例，裁剪多余部分
          htmlEl.style.objectPosition = 'center' // 居中显示
          htmlEl.style.width = '100%'
          htmlEl.style.height = '100%'
          console.log('✅ 已为克隆图片应用object-fit: cover')
        }
      })
      
      // 添加到DOM
      document.body.appendChild(clonedCard)
      
      // 等待渲染完成
      await new Promise(resolve => setTimeout(resolve, 1000)) // 增加等待时间
      
      // 获取设备像素比，确保高分辨率设备正确渲染
      const dpr = window.devicePixelRatio || 1
      const targetScale = Math.max(2, 2 * dpr) // 至少2倍，考虑设备像素比
      console.log('设备像素比:', dpr, '目标缩放:', targetScale)
      
      // Canvas初始化验证函数
      const validateCanvas = (canvas: HTMLCanvasElement): boolean => {
        if (!canvas) {
          console.error('❌ Canvas元素未创建')
          return false
        }
        
        if (canvas.width === 0 || canvas.height === 0) {
          console.error(`❌ Canvas尺寸为0: ${canvas.width}x${canvas.height}`)
          return false
        }
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.error('❌ 无法获取Canvas 2D上下文')
          return false
        }
        
        console.log(`✅ Canvas验证通过: ${canvas.width}x${canvas.height}`)
        return true
      }
      
      // 使用优化的html2canvas配置 - 彻底修复变形问题
      const canvas = await html2canvas(clonedCard, {
        backgroundColor: '#ffffff', // 设置白色背景确保有内容
        useCORS: true,
        allowTaint: true,
        scale: 4, // 使用4倍缩放确保高清输出
        width: 350, // 固定宽度
        height: 500, // 固定高度
        logging: true, // 开启日志以便调试
        foreignObjectRendering: false, // 禁用以避免渲染问题
        removeContainer: false, // 不禁用以保持容器
        imageTimeout: 30000, // 增加超时时间
        // 移除可能导致变形的参数
        // x: 0,
        // y: 0,
        // scrollX: 0,
        // scrollY: 0,
        onclone: (clonedDoc) => {
          console.log('onclone 回调执行')
          // 确保克隆文档中的样式正确
          const clonedCardInDoc = clonedDoc.querySelector('[data-card-ref="true"]') as HTMLElement
          if (clonedCardInDoc) {
            console.log('找到克隆的卡片元素')
            
            // 重置所有可能影响变形的样式
            clonedCardInDoc.style.transform = 'none !important'
            clonedCardInDoc.style.zoom = '1 !important'
            clonedCardInDoc.style.scale = 'none !important'
            clonedCardInDoc.style.width = '350px' // 固定宽度
            clonedCardInDoc.style.height = '500px' // 固定高度
            clonedCardInDoc.style.minWidth = '350px'
            clonedCardInDoc.style.maxWidth = '350px'
            clonedCardInDoc.style.minHeight = '500px'
            clonedCardInDoc.style.maxHeight = '500px'
            clonedCardInDoc.style.backgroundSize = 'cover' // 保持cover效果
            clonedCardInDoc.style.backgroundPosition = 'center'
            clonedCardInDoc.style.backgroundRepeat = 'no-repeat'
            clonedCardInDoc.style.position = 'relative'
            clonedCardInDoc.style.display = 'block'
            clonedCardInDoc.style.boxSizing = 'border-box' // 确保盒模型正确
            clonedCardInDoc.style.backgroundColor = '#ffffff' // 确保有背景色
            clonedCardInDoc.style.visibility = 'visible'
            clonedCardInDoc.style.opacity = '1'
            clonedCardInDoc.style.overflow = 'hidden'
            clonedCardInDoc.style.borderRadius = '16px'
            clonedCardInDoc.style.border = '1px solid #d1d5db'
            clonedCardInDoc.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            
            // 确保背景图片正确设置
            if (backgroundImage) {
              clonedCardInDoc.style.backgroundImage = `url(${backgroundImage})`
              console.log('✅ 已设置背景图片:', backgroundImage)
            }
            
            // 确保所有子元素也可见，并应用object-fit防止变形
            const allChildren = clonedCardInDoc.querySelectorAll('*')
            allChildren.forEach((child: Element) => {
              const htmlChild = child as HTMLElement
              htmlChild.style.visibility = 'visible'
              htmlChild.style.opacity = '1'
              htmlChild.style.display = htmlChild.tagName === 'IMG' ? 'block' : 'inline'
              htmlChild.style.transform = 'none !important'
              htmlChild.style.zoom = '1 !important'
              htmlChild.style.scale = 'none !important'
              
              // 对图片元素应用object-fit防止变形
              if (htmlChild.tagName === 'IMG') {
                htmlChild.style.objectFit = 'cover' // 保持比例，裁剪多余部分
                htmlChild.style.objectPosition = 'center' // 居中显示
                htmlChild.style.width = '100%'
                htmlChild.style.height = '100%'
                htmlChild.style.maxWidth = '100%'
                htmlChild.style.maxHeight = '100%'
                htmlChild.style.minWidth = '100%'
                htmlChild.style.minHeight = '100%'
                console.log('✅ 已为图片应用object-fit: cover')
              }
              
              // 确保圆形头像容器正确渲染
              if (htmlChild.classList.contains('rounded-full') || htmlChild.style.borderRadius === '50%') {
                htmlChild.style.borderRadius = '50%'
                htmlChild.style.overflow = 'hidden'
                htmlChild.style.border = '4px solid #ffffff'
                htmlChild.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                console.log('✅ 已设置圆形头像样式')
              }
            })
          } else {
            console.warn('未找到克隆的卡片元素')
          }
          
          // 移除所有子元素的变换
          const allClonedElements = clonedDoc.querySelectorAll('*')
          allClonedElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement
            if (htmlEl.style.transform && htmlEl.style.transform !== 'none') {
              htmlEl.style.transform = 'none !important'
            }
            htmlEl.style.zoom = '1 !important'
            htmlEl.style.scale = 'none !important'
          })
        }
      })
      
      // 清理DOM
      document.body.removeChild(clonedCard)
      
      // Canvas初始化验证
      if (!validateCanvas(canvas)) {
        console.warn('Canvas初始化验证失败，尝试使用原始元素导出')
        // 如果克隆元素失败，直接使用原始元素
        const fallbackCanvas = await html2canvas(originalCard, {
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: true,
          scale: 2,
          width: 350,
          height: 500,
          logging: true,
          foreignObjectRendering: false,
          removeContainer: false,
          imageTimeout: 30000,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
        })
        
        if (validateCanvas(fallbackCanvas)) {
          console.log('✅ 使用原始元素导出成功')
          return fallbackCanvas
        } else {
          throw new Error('Canvas初始化验证失败')
        }
      }
      
      console.log('Canvas尺寸:', canvas.width, 'x', canvas.height)
      console.log('原始比例:', rect.width / rect.height)
      console.log('Canvas比例:', canvas.width / canvas.height)
      
      // Canvas内容验证
      const canvasCtx = canvas.getContext('2d')
      if (canvasCtx) {
        const imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        let nonTransparentPixels = 0
        
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 0) { // alpha > 0
            nonTransparentPixels++
          }
        }
        
        console.log('Canvas内容验证:')
        console.log('- 总像素数:', canvas.width * canvas.height)
        console.log('- 非透明像素数:', nonTransparentPixels)
        console.log('- 透明度比例:', (nonTransparentPixels / (canvas.width * canvas.height) * 100).toFixed(2) + '%')
        
        // 降低阈值，允许更少的内容
        if (nonTransparentPixels < 10) {
          console.warn(`Canvas内容较少: 只有${nonTransparentPixels}个非透明像素，但继续导出`)
          // 不抛出错误，继续导出
        } else {
          console.log('✅ Canvas内容验证通过')
        }
      }
      
      // 验证宽高比是否正确
      const originalRatio = rect.width / rect.height
      const canvasRatio = canvas.width / canvas.height
      const ratioDiff = Math.abs(originalRatio - canvasRatio)
      
      if (ratioDiff > 0.01) {
        console.warn('宽高比不匹配! 原始:', originalRatio, 'Canvas:', canvasRatio)
      } else {
        console.log('✅ 宽高比匹配! 比例:', originalRatio)
      }
      
      // 检查canvas是否有内容 - 改进检查逻辑
      const checkCtx = canvas.getContext('2d')
      if (!checkCtx) {
        throw new Error('无法获取Canvas上下文')
      }
      
      const imageData = checkCtx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        let hasContent = false
      let nonTransparentPixels = 0
      
        for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3] // alpha通道
        if (a > 0) {
          nonTransparentPixels++
            hasContent = true
        }
      }
      
      console.log('Canvas内容检查:', {
        hasContent,
        nonTransparentPixels,
        totalPixels: pixels.length / 4,
        canvasSize: `${canvas.width}x${canvas.height}`
      })
      
      if (!hasContent || nonTransparentPixels < 100) {
        throw new Error(`Canvas内容为空或内容过少。透明像素: ${nonTransparentPixels}`)
      }
      
      // 零压缩导出 - 使用备选方案
      const exportBlob = async () => {
        return new Promise<Blob>((resolve, reject) => {
          try {
        canvas.toBlob((blob) => {
          if (blob) {
                console.log(`${format.toUpperCase()} Blob大小:`, blob.size, 'bytes')
                resolve(blob)
          } else {
                // 如果toBlob失败，使用toDataURL作为备选
                console.log('toBlob失败，使用toDataURL备选方案')
                const dataURL = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 1.0)
                const byteString = atob(dataURL.split(',')[1])
                const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
                const ab = new ArrayBuffer(byteString.length)
                const ia = new Uint8Array(ab)
                for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i)
                }
                resolve(new Blob([ab], { type: mimeString }))
              }
            }, format === 'jpg' ? 'image/jpeg' : 'image/png', 1.0)
          } catch (error) {
            reject(error)
          }
        })
      }
      
      const blob = await exportBlob()
      const filename = `${user.name || 'business-card'}-名片-零压缩.${format}`
      saveAs(blob, filename)
      alert(`零压缩${format.toUpperCase()}导出成功！`)
      
    } catch (error: any) {
      console.error('零压缩导出失败:', error)
      alert('零压缩导出失败: ' + (error?.message || '未知错误'))
    } finally {
      setExporting(false)
    }
  }

  // 优化的精确导出方法 - 修复版
  const handlePreciseExport = async (format: 'png' | 'jpg' = 'png') => {
    console.log('=== 优化导出开始 ===')
    
    if (!cardRef.current || !user) {
      alert('错误：无法找到名片元素或用户信息缺失')
      return
    }

    setExporting(true)
    
    try {
      // 获取设备像素比，确保高分辨率设备正确渲染
      const dpr = window.devicePixelRatio || 1
      const targetScale = Math.max(4, 4 * dpr) // 提高到4倍，确保高清输出
      
      console.log('设备像素比:', dpr, '目标缩放:', targetScale)
      
      // 创建优化的导出元素
      const originalCard = cardRef.current
      const clonedCard = originalCard.cloneNode(true) as HTMLElement
      
      // 移除所有CSS变换，确保正确渲染
      clonedCard.style.position = 'absolute'
      clonedCard.style.left = '-9999px'
      clonedCard.style.top = '0'
      clonedCard.style.width = '350px'  // 原始尺寸
      clonedCard.style.height = '500px' // 原始尺寸
      clonedCard.style.transform = 'none !important' // 移除变换
      clonedCard.style.zoom = '1 !important' // 重置缩放
      clonedCard.style.backgroundSize = 'cover' // 保持cover效果
      clonedCard.style.backgroundPosition = 'center'
      clonedCard.style.backgroundRepeat = 'no-repeat'
      clonedCard.style.borderRadius = '16px'
      clonedCard.style.overflow = 'hidden'
      clonedCard.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      
      // 移除所有子元素的变换，并应用object-fit防止变形
      const allElements = clonedCard.querySelectorAll('*')
      allElements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement
        htmlEl.style.transform = 'none !important'
        htmlEl.style.zoom = '1 !important'
        htmlEl.style.scale = 'none !important'
        
        // 对图片元素应用object-fit防止变形
        if (htmlEl.tagName === 'IMG') {
          htmlEl.style.objectFit = 'cover' // 保持比例，裁剪多余部分
          htmlEl.style.objectPosition = 'center' // 居中显示
          htmlEl.style.width = '100%'
          htmlEl.style.height = '100%'
          console.log('✅ 已为精确导出图片应用object-fit: cover')
        }
      })
      
      // 添加到DOM
      document.body.appendChild(clonedCard)
      
      // 等待渲染完成
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 使用优化的html2canvas配置 - 彻底修复变形问题并提高质量
      const canvas = await html2canvas(clonedCard, {
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        scale: targetScale, // 使用高缩放比例确保高清输出
        width: 350 * targetScale,
        height: 500 * targetScale,
        logging: true, // 开启日志以便调试
        foreignObjectRendering: false, // 禁用以避免渲染问题
        removeContainer: false, // 不禁用以保持容器
        imageTimeout: 30000, // 增加超时时间
        // 移除可能导致变形的参数
        onclone: (clonedDoc) => {
          console.log('精确导出 onclone 回调执行')
          // 确保克隆文档中的样式正确
          const clonedCardInDoc = clonedDoc.querySelector('[data-card-ref="true"]') as HTMLElement
          if (clonedCardInDoc) {
            console.log('找到克隆的卡片元素')
            
            // 重置所有可能影响变形的样式
            clonedCardInDoc.style.transform = 'none !important'
            clonedCardInDoc.style.zoom = '1 !important'
            clonedCardInDoc.style.scale = 'none !important'
            clonedCardInDoc.style.width = '350px' // 固定宽度
            clonedCardInDoc.style.height = '500px' // 固定高度
            clonedCardInDoc.style.minWidth = '350px'
            clonedCardInDoc.style.maxWidth = '350px'
            clonedCardInDoc.style.minHeight = '500px'
            clonedCardInDoc.style.maxHeight = '500px'
            clonedCardInDoc.style.backgroundSize = 'cover' // 保持cover效果
            clonedCardInDoc.style.backgroundPosition = 'center'
            clonedCardInDoc.style.backgroundRepeat = 'no-repeat'
            clonedCardInDoc.style.position = 'relative'
            clonedCardInDoc.style.display = 'block'
            clonedCardInDoc.style.boxSizing = 'border-box' // 确保盒模型正确
            clonedCardInDoc.style.backgroundColor = '#ffffff' // 确保有背景色
            clonedCardInDoc.style.visibility = 'visible'
            clonedCardInDoc.style.opacity = '1'
            clonedCardInDoc.style.overflow = 'hidden'
            clonedCardInDoc.style.borderRadius = '16px'
            clonedCardInDoc.style.border = '1px solid #d1d5db'
            clonedCardInDoc.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            
            // 确保背景图片正确设置
            if (backgroundImage) {
              clonedCardInDoc.style.backgroundImage = `url(${backgroundImage})`
              console.log('✅ 已设置背景图片:', backgroundImage)
            }
            
            // 为所有图片元素应用object-fit防止变形
            const allImages = clonedCardInDoc.querySelectorAll('img')
            allImages.forEach((img: Element) => {
              const htmlImg = img as HTMLElement
              htmlImg.style.objectFit = 'cover' // 保持比例，裁剪多余部分
              htmlImg.style.objectPosition = 'center' // 居中显示
              htmlImg.style.width = '100%'
              htmlImg.style.height = '100%'
              htmlImg.style.maxWidth = '100%'
              htmlImg.style.maxHeight = '100%'
              htmlImg.style.minWidth = '100%'
              htmlImg.style.minHeight = '100%'
              htmlImg.style.transform = 'none !important'
              htmlImg.style.zoom = '1 !important'
              htmlImg.style.scale = 'none !important'
              console.log('✅ 已为精确导出onclone图片应用object-fit: cover')
            })
            
            // 确保圆形头像容器正确渲染
            const allElements = clonedCardInDoc.querySelectorAll('*')
            allElements.forEach((el: Element) => {
              const htmlEl = el as HTMLElement
              if (htmlEl.classList.contains('rounded-full') || htmlEl.style.borderRadius === '50%') {
                htmlEl.style.borderRadius = '50%'
                htmlEl.style.overflow = 'hidden'
                htmlEl.style.border = '4px solid #ffffff'
                htmlEl.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                console.log('✅ 已设置圆形头像样式')
              }
            })
          } else {
            console.warn('未找到克隆的卡片元素')
          }
          
          // 移除所有子元素的变换
          const allClonedElements = clonedDoc.querySelectorAll('*')
          allClonedElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement
            htmlEl.style.transform = 'none !important'
            htmlEl.style.zoom = '1 !important'
            htmlEl.style.scale = 'none !important'
          })
        }
      })
      
      // 清理DOM
      document.body.removeChild(clonedCard)
      
      console.log('Canvas尺寸:', canvas.width, 'x', canvas.height)
      console.log('Canvas样式尺寸:', canvas.style.width, 'x', canvas.style.height)
      
      // 检查canvas是否有内容 - 改进检查逻辑
      const finalCtx = canvas.getContext('2d')
      if (!finalCtx) {
        throw new Error('无法获取Canvas上下文')
      }
      
      const imageData = finalCtx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        let hasContent = false
      let nonTransparentPixels = 0
      
        for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3] // alpha通道
        if (a > 0) {
          nonTransparentPixels++
            hasContent = true
        }
      }
      
      console.log('精确导出Canvas内容检查:', {
        hasContent,
        nonTransparentPixels,
        totalPixels: pixels.length / 4,
        canvasSize: `${canvas.width}x${canvas.height}`
      })
      
      if (!hasContent || nonTransparentPixels < 100) {
        throw new Error(`Canvas内容为空或内容过少。透明像素: ${nonTransparentPixels}`)
      }
      
      // 使用toBlob获得最高质量 - 添加备选方案
      const exportBlob = async () => {
        return new Promise<Blob>((resolve, reject) => {
          try {
      canvas.toBlob((blob) => {
        if (blob) {
                console.log('精确导出Blob大小:', blob.size, 'bytes')
                resolve(blob)
        } else {
                // 如果toBlob失败，使用toDataURL作为备选
                console.log('toBlob失败，使用toDataURL备选方案')
                const dataURL = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 1.0)
                const byteString = atob(dataURL.split(',')[1])
                const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
                const ab = new ArrayBuffer(byteString.length)
                const ia = new Uint8Array(ab)
                for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i)
                }
                resolve(new Blob([ab], { type: mimeString }))
              }
            }, format === 'jpg' ? 'image/jpeg' : 'image/png', 1.0)
          } catch (error) {
            reject(error)
          }
        })
      }
      
      const blob = await exportBlob()
      const filename = `${user.name || 'business-card'}-名片.${format}`
      saveAs(blob, filename)
      alert('优化导出成功！')
      
    } catch (error: any) {
      console.error('优化导出失败:', error)
      alert('优化导出失败: ' + (error?.message || '未知错误'))
    } finally {
      setExporting(false)
    }
  }

  // 获取启用的能力标签
  const getActiveAbilities = () => {
    const activeAbilities = []
    if (abilities.teacherScreening) activeAbilities.push({
      text: textModules.teacherSelectionLabel,
      key: 'teacherSelectionLabel'
    })
    if (abilities.feedbackAbility) activeAbilities.push({
      text: textModules.progressFeedbackLabel,
      key: 'progressFeedbackLabel'
    })
    if (abilities.planningAbility) activeAbilities.push({
      text: textModules.planningLabel,
      key: 'planningLabel'
    })
    if (abilities.resourceSharing) activeAbilities.push({
      text: textModules.resourceSharingLabel,
      key: 'resourceSharingLabel'
    })
    return activeAbilities
  }

  const activeAbilities = getActiveAbilities()

  // 拖拽开始
  const handleMouseDown = (e: React.MouseEvent, moduleId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDraggedElement(moduleId)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  // 头像拖拽开始
  const handleAvatarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDraggedElement('avatar')
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  // Logo拖拽开始
  const handleLogoMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDraggedElement('logo')
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }


  // 拖拽移动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedElement) return

    const rect = e.currentTarget.getBoundingClientRect()
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y

    if (draggedElement === 'avatar') {
      // 头像拖动 - 适应更大的头像尺寸
      const constrainedX = Math.max(0, Math.min(newX, 350 - avatarConfig.size))
      const constrainedY = Math.max(0, Math.min(newY, 500 - avatarConfig.size))
      
      if (onAvatarPositionChange) {
        onAvatarPositionChange(constrainedX, constrainedY)
      }
    } else if (draggedElement === 'logo' && logoConfig) {
      // Logo拖动
      const constrainedX = Math.max(0, Math.min(newX, 350 - logoConfig.size.width))
      const constrainedY = Math.max(0, Math.min(newY, 500 - logoConfig.size.height))
      
      if (onLogoPositionChange) {
        onLogoPositionChange(constrainedX, constrainedY)
      }
    } else {
      // 文字模块拖动
      const constrainedX = Math.max(0, Math.min(newX, 350 - 100)) // 350是卡片宽度，100是元素最大宽度
      const constrainedY = Math.max(0, Math.min(newY, 500 - 50)) // 500是卡片高度，50是元素最大高度

      if (onPositionChange) {
        onPositionChange(draggedElement, constrainedX, constrainedY)
      }
    }
  }

  // 拖拽结束
  const handleMouseUp = () => {
    setDraggedElement(null)
  }

  // 仅允许拖拽：名字与头衔（头像拖拽逻辑独立保留）
  const canDrag = (id: string): boolean => id === 'name' || id === 'title'
  const isDraggable = (id: string): boolean => canDrag(id)

  // 渲染可拖拽的文字元素
  const renderDraggableText = (
    moduleId: keyof TextPositions,
    text: string,
    style: TextStyles[keyof TextStyles],
    position: TextPositions[keyof TextPositions],
    showCoordinates: boolean = false
  ) => {
    return (
      <div
        data-module-id={moduleId}
        className={`absolute select-none ${
          isDraggable(moduleId) ? 'cursor-move' : 'cursor-default'
        } ${draggedElement === moduleId ? 'z-50' : 'z-10'}`}
        style={{
          left: position.x,
          top: position.y,
          fontSize: `${style.fontSize}px`,
          color: style.color,
          fontWeight: style.fontWeight,
          // 阿拉伯语显示优化：title 保持单行且从右到左
          ...(moduleId === 'title'
            ? { whiteSpace: 'nowrap', direction: 'rtl', wordBreak: 'keep-all', lineHeight: '1.2' }
            : {}),
          pointerEvents: 'auto',
          transform: draggedElement === moduleId ? 'scale(1.05)' : 'scale(1)',
          transition: draggedElement === moduleId ? 'none' : 'transform 0.2s ease'
        }}
        onMouseDown={isDraggable(moduleId) ? (e) => handleMouseDown(e, moduleId) : undefined}
      >
        {text}
        {showCoordinates && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              fontSize: '10px',
              color: '#666',
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '2px 4px',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            ({Math.round(position.x)}, {Math.round(position.y)})
          </div>
        )}
      </div>
    )
  }

  // 文案归一化：将历史英文值映射为阿拉伯语，避免持久化导致仍显示英文
  const normalizeLabel = (value: string | undefined, arabicDefault: string): string => {
    const v = (value || '').trim()
    switch (v) {
      case 'Teacher\nSelection':
      case 'Teacher Selection':
        return 'اختيار\nالمعلم'
      case 'Progress\nFeedback':
      case 'Progress Feedback':
        return 'تعليقات\nالتقدم'
      case 'Study\nPlan':
      case 'Study Plan':
        return 'خطة\nالدراسة'
      case 'Learning\nResources':
      case 'Learning Resources':
        return 'موارد\nالتعلم'
      default:
        return v || arabicDefault
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 工具栏 - 隐藏上传底图和显示坐标按钮 */}
      <div className="flex gap-2 p-3 bg-gray-100 rounded-lg">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="hidden px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
        >
          上传底图
        </button>
        <div className="flex gap-2 flex-wrap"></div>
          <button
          onClick={() => setShowCoordinates(!showCoordinates)}
          className={`hidden px-3 py-1 rounded text-sm transition-colors ${
            showCoordinates 
              ? 'bg-yellow-400 text-black hover:bg-yellow-500' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          {showCoordinates ? '隐藏坐标' : '显示坐标'}
          </button>
        <div className="text-xs text-gray-600 flex items-center">
          拖拽文字模块调整位置
        </div>
      </div>

      {/* ✂️ 裁剪导出按钮 - 已按要求隐藏，仅保留DOM导出模块 */}
      <div className="hidden">
        {/* 保留代码以便将来启用 */}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundUpload}
        className="hidden"
      />

      {/* 名片画布 - 可拖拽版本 - 混合背景方案 */}
      <div 
        ref={cardRef}
        data-card-ref="true"
        data-export-target="true"
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          // 🎯 终极修复：去掉边框，确保容器就是350x500
          position: 'relative',
          width: '350px',
          height: '500px',
          minWidth: '350px',
          minHeight: '500px',
          maxWidth: '350px',
          maxHeight: '500px',
          boxSizing: 'border-box',
          margin: '0 auto',
          flexShrink: 0,
          flexGrow: 0,
          display: 'block',
          padding: 0,
          backgroundColor: '#ffffff', // 白色背景作为备用
          // 🎯 预览时使用CSS背景，导出时切换到img
          ...(useImgBackground ? {} : {
          backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
          })
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
          {/* 🎯 导出时显示的img背景 */}
          {useImgBackground && (
            <img 
              src={backgroundImage}
              alt="名片背景"
              style={backgroundImageStyle}
              onLoad={() => {
                // 图片加载完成后重新计算尺寸（防止缓存问题）
                if (backgroundImage) {
                  calculateBackgroundImageDimensions(backgroundImage)
                }
              }}
              onError={() => {
                console.warn('❌ 背景图片加载失败')
              }}
            />
          )}
          {/* 头像 - 可拖动位置 */}
          {user.avatar_url && (
            <div 
              className="absolute cursor-move select-none"
              style={{
                left: `${avatarConfig.position.x}px`,
                top: `${avatarConfig.position.y}px`,
                width: `${avatarConfig.size}px`,
                height: `${avatarConfig.size}px`,
                zIndex: 10  // 确保显示在背景图片之上
              }}
              onMouseDown={handleAvatarMouseDown}
            >
              <div 
                className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg"
                style={{
                  width: `${avatarConfig.size}px`,
                  height: `${avatarConfig.size}px`
                }}
              >
                <img 
                  src={user.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 头像坐标显示 */}
              {showCoordinates && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    fontSize: '10px',
                    color: '#666',
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}
                >
                  ({Math.round(avatarConfig.position.x)}, {Math.round(avatarConfig.position.y)})
                </div>
              )}
            </div>
          )}


          {renderDraggableText(
            'name',
            textModules.name || 'أحمد',
            textStyles.name,
            textPositions.name,
            showCoordinates
          )}

          {renderDraggableText(
            'title',
            textModules.title || user.title || 'شريك النمو الرئيسي',
            textStyles.title,
            textPositions.title,
            showCoordinates
          )}

          {/* 统计数据 - 无边框横排显示 */}
          <div
            className={`absolute ${isDraggable('studentsServed') ? 'cursor-move' : 'cursor-default'} select-none ${
              draggedElement === 'studentsServed' ? 'z-50' : 'z-10'
            }`}
            data-module-id="studentsServed"
            style={{
              left: textPositions.studentsServed.x,
              top: textPositions.studentsServed.y,
              pointerEvents: isDraggable('studentsServed') ? 'auto' : 'none',
              transform: draggedElement === 'studentsServed' ? 'scale(1.05)' : 'scale(1)',
              transition: draggedElement === 'studentsServed' ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={isDraggable('studentsServed') ? (e) => handleMouseDown(e, 'studentsServed') : undefined}
          >
            <div className="flex flex-col items-center justify-center text-center">
              {/* 主要数字显示 */}
              <div 
                style={{
                  fontSize: `${textStyles.studentsServed?.fontSize || 16}px`,
                  color: textStyles.studentsServed?.color || '#000000',
                  fontWeight: textStyles.studentsServed?.fontWeight || 'bold',
                  textAlign: 'center'
                }}
              >
                {textModules.studentsServed >= 1000 
                  ? `${Math.floor(textModules.studentsServed / 1000)}K+`
                  : textModules.studentsServed
                }
              </div>
              
              {/* 阿拉伯语标签 */}
              <div 
                className="text-[6px] leading-tight"
                style={{
                  color: textStyles.studentsServed?.color || '#000000',
                  fontWeight: textStyles.studentsServed?.fontWeight || 'normal',
                  whiteSpace: 'nowrap',
                  direction: 'rtl',
                  textAlign: 'center'
                }}
              >
                الطلاب المخدومون
              </div>
              {showCoordinates && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: '#666',
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}
                >
                  ({Math.round(textPositions.studentsServed.x)}, {Math.round(textPositions.studentsServed.y)})
                </div>
              )}
            </div>
          </div>

          <div
            className={`absolute ${isDraggable('positiveRating') ? 'cursor-move' : 'cursor-default'} select-none ${
              draggedElement === 'positiveRating' ? 'z-50' : 'z-10'
            }`}
            data-module-id="positiveRating"
            style={{
              left: textPositions.positiveRating.x,
              top: textPositions.positiveRating.y,
              pointerEvents: isDraggable('positiveRating') ? 'auto' : 'none',
              transform: draggedElement === 'positiveRating' ? 'scale(1.05)' : 'scale(1)',
              transition: draggedElement === 'positiveRating' ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={isDraggable('positiveRating') ? (e) => handleMouseDown(e, 'positiveRating') : undefined}
          >
            <div className="flex flex-col items-center justify-center text-center">
              {/* 主要数字显示 */}
              <div 
                style={{
                  fontSize: `${textStyles.positiveRating?.fontSize || 16}px`,
                  color: textStyles.positiveRating?.color || '#000000',
                  fontWeight: textStyles.positiveRating?.fontWeight || 'bold',
                  textAlign: 'center'
                }}
              >
                {textModules.positiveRating}%
              </div>
              
              {/* 阿拉伯语标签 */}
              <div 
                className="text-[6px] leading-tight"
                style={{
                  color: textStyles.positiveRating?.color || '#000000',
                  fontWeight: textStyles.positiveRating?.fontWeight || 'normal',
                  whiteSpace: 'nowrap',
                  direction: 'rtl',
                  textAlign: 'center'
                }}
              >
                نسبة النجاح
              </div>
              {showCoordinates && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: '#666',
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}
                >
                  ({Math.round(textPositions.positiveRating.x)}, {Math.round(textPositions.positiveRating.y)})
                </div>
              )}
            </div>
          </div>

          {/* 电话模块 - 固定位置，不可拖动 */}
          <div
            className="absolute select-none"
            style={{
              left: textPositions.phone.x,
              top: textPositions.phone.y,
              transform: 'translateX(-50%)',
              maxWidth: '300px'
            }}
          >
            <span
              style={{
                fontSize: `${textStyles.phone?.fontSize || 14}px`,
                color: textStyles.phone?.color || '#000000',
                fontWeight: textStyles.phone?.fontWeight || 'bold',
                whiteSpace: 'nowrap',
                wordWrap: 'normal',
                wordBreak: 'normal',
                overflow: 'hidden',
                display: 'inline-block'
              }}
              ref={(el) => {
                if (!el) return
                // 动态调整字体大小以适应容器
                const phoneText = `هاتف: ${textModules.phone || user.phone || '050-XXXX-XXAB'}`
                el.textContent = phoneText
                
                let fontSize = textStyles.phone?.fontSize || 14
                const minFontSize = 10
                const maxWidth = 280
                
                el.style.fontSize = `${fontSize}px`
                
                // 如果文本超出宽度，逐步减小字体
                while (el.scrollWidth > maxWidth && fontSize > minFontSize) {
                  fontSize -= 0.5
                  el.style.fontSize = `${fontSize}px`
                }
              }}
            />
            {showCoordinates && (
              <div
                className="absolute top-full left-0 text-xs text-gray-600 bg-white bg-opacity-80 px-1 rounded pointer-events-none"
                style={{ zIndex: 1000 }}
              >
                ({Math.round(textPositions.phone.x)}, {Math.round(textPositions.phone.y)})
              </div>
            )}
          </div>

          {/* 能力标签 - 四个独立的可拖拽元素，无图标，英文两排显示 */}
          {/* 教师筛选 */}
          <div
            className={`absolute cursor-default select-none ${
              draggedElement === 'teacherSelectionLabel' ? 'z-50' : 'z-10'
            }`}
            data-module-id="teacherSelectionLabel"
            style={{
              left: textPositions.teacherSelectionLabel.x,
              top: textPositions.teacherSelectionLabel.y,
              pointerEvents: 'none',
              transform: draggedElement === 'teacherSelectionLabel' ? 'scale(1.05)' : 'scale(1)',
              transition: draggedElement === 'teacherSelectionLabel' ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={undefined}
          >
            <div className="flex flex-col items-center text-center">
              <div 
                className="leading-tight text-center"
                style={{
                  fontSize: `${textStyles.teacherSelectionLabel?.fontSize || 8}px`,
                  color: textStyles.teacherSelectionLabel?.color || '#666666',
                  fontWeight: textStyles.teacherSelectionLabel?.fontWeight || 'normal'
                }}
              >
                {(normalizeLabel(textModules.teacherSelectionLabel, 'اختيار\nالمعلم')).split('\n').map((line, index, array) => (
                  <span key={index}>
                    {line}
                    {index < array.length - 1 && <br />}
                  </span>
                ))}
              </div>
              {showCoordinates && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: '#666',
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}
                >
                  ({Math.round(textPositions.teacherSelectionLabel.x)}, {Math.round(textPositions.teacherSelectionLabel.y)})
                </div>
              )}
            </div>
          </div>

          {/* 进度反馈 */}
          <div
            className={`absolute cursor-default select-none ${
              draggedElement === 'progressFeedbackLabel' ? 'z-50' : 'z-10'
            }`}
            data-module-id="progressFeedbackLabel"
            style={{
              left: textPositions.progressFeedbackLabel.x,
              top: textPositions.progressFeedbackLabel.y,
              pointerEvents: 'none',
              transform: draggedElement === 'progressFeedbackLabel' ? 'scale(1.05)' : 'scale(1)',
              transition: draggedElement === 'progressFeedbackLabel' ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={undefined}
          >
            <div className="flex flex-col items-center text-center">
              <div 
                className="leading-tight text-center"
                style={{
                  fontSize: `${textStyles.progressFeedbackLabel?.fontSize || 8}px`,
                  color: textStyles.progressFeedbackLabel?.color || '#666666',
                  fontWeight: textStyles.progressFeedbackLabel?.fontWeight || 'normal'
                }}
              >
                {(normalizeLabel(textModules.progressFeedbackLabel, 'تعليقات\nالتقدم')).split('\n').map((line, index, array) => (
                  <span key={index}>
                    {line}
                    {index < array.length - 1 && <br />}
                  </span>
                ))}
              </div>
              {showCoordinates && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: '#666',
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}
                >
                  ({Math.round(textPositions.progressFeedbackLabel.x)}, {Math.round(textPositions.progressFeedbackLabel.y)})
                </div>
              )}
            </div>
          </div>

          {/* 学习计划 */}
          <div
            className={`absolute cursor-default select-none ${
              draggedElement === 'planningLabel' ? 'z-50' : 'z-10'
            }`}
            data-module-id="planningLabel"
            style={{
              left: textPositions.planningLabel.x,
              top: textPositions.planningLabel.y,
              pointerEvents: 'none',
              transform: draggedElement === 'planningLabel' ? 'scale(1.05)' : 'scale(1)',
              transition: draggedElement === 'planningLabel' ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={undefined}
          >
            <div className="flex flex-col items-center text-center">
              <div 
                className="leading-tight text-center"
                style={{
                  fontSize: `${textStyles.planningLabel?.fontSize || 8}px`,
                  color: textStyles.planningLabel?.color || '#666666',
                  fontWeight: textStyles.planningLabel?.fontWeight || 'normal'
                }}
              >
                {(normalizeLabel(textModules.planningLabel, 'خطة\nالدراسة')).split('\n').map((line, index, array) => (
                  <span key={index}>
                    {line}
                    {index < array.length - 1 && <br />}
                  </span>
                ))}
              </div>
              {showCoordinates && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: '#666',
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}
                >
                  ({Math.round(textPositions.planningLabel.x)}, {Math.round(textPositions.planningLabel.y)})
                </div>
              )}
            </div>
          </div>

          {/* 学习资源 */}
          <div
            className={`absolute cursor-default select-none ${
              draggedElement === 'resourceSharingLabel' ? 'z-50' : 'z-10'
            }`}
            data-module-id="resourceSharingLabel"
            style={{
              left: textPositions.resourceSharingLabel.x,
              top: textPositions.resourceSharingLabel.y,
              pointerEvents: 'none',
              transform: draggedElement === 'resourceSharingLabel' ? 'scale(1.05)' : 'scale(1)',
              transition: draggedElement === 'resourceSharingLabel' ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={undefined}
          >
            <div className="flex flex-col items-center text-center">
              <div 
                className="leading-tight text-center"
                style={{
                  fontSize: `${textStyles.resourceSharingLabel?.fontSize || 8}px`,
                  color: textStyles.resourceSharingLabel?.color || '#666666',
                  fontWeight: textStyles.resourceSharingLabel?.fontWeight || 'normal'
                }}
              >
                {(normalizeLabel(textModules.resourceSharingLabel, 'موارد\nالتعلم')).split('\n').map((line, index, array) => (
                  <span key={index}>
                    {line}
                    {index < array.length - 1 && <br />}
                  </span>
                ))}
              </div>
              {showCoordinates && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: '#666',
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}
                >
                  ({Math.round(textPositions.resourceSharingLabel.x)}, {Math.round(textPositions.resourceSharingLabel.y)})
                </div>
              )}
            </div>
          </div>

          {/* Logo模块 - 可拖拽 */}
          {logoConfig && logoConfig.enabled && (
            <div
              className={`absolute cursor-move select-none ${
                draggedElement === 'logo' ? 'z-50' : 'z-10'
              }`}
              data-module-id="logo"
              style={{
                left: logoConfig.position.x,
                top: logoConfig.position.y,
                width: logoConfig.size.width,
                height: logoConfig.size.height,
                transform: draggedElement === 'logo' ? 'scale(1.05)' : 'scale(1)',
                transition: draggedElement === 'logo' ? 'none' : 'transform 0.2s ease'
              }}
              onMouseDown={handleLogoMouseDown}
            >
              <img 
                src={logoConfig.src} 
                alt="Logo"
                className="w-full h-full object-contain"
                draggable={false}
                onError={(e) => {
                  console.warn('Logo加载失败:', logoConfig.src)
                  e.currentTarget.style.display = 'none'
                }}
              />
              
              {/* Logo坐标显示 */}
              {showCoordinates && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    fontSize: '10px',
                    color: '#666',
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}
                >
                  Logo: ({Math.round(logoConfig.position.x)}, {Math.round(logoConfig.position.y)})
                </div>
              )}
            </div>
          )}
        </div>

      {/* 导出按钮 - 已隐藏，只保留DOM导出 */}
      <div className="hidden flex gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleImgBasedExport('png')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              exporting 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
            disabled={exporting}
          >
{exporting ? '⏳ 导出中...' : '🆕 新img导出PNG (推荐)'}
          </button>
          <button
            onClick={() => handleImgBasedExport('jpg')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              exporting 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-yellow-400 text-black hover:bg-yellow-500'
            }`}
            disabled={exporting}
          >
{exporting ? '⏳ 导出中...' : '🆕 新img导出JPG'}
          </button>
          <button
            onClick={() => handlePerfectExport('png')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              exporting 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            disabled={exporting}
          >
            隔离PNG
          </button>
          <button
            onClick={() => handleSimpleExport('png')}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              exporting 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
            disabled={exporting}
          >
            备用PNG
          </button>
          <button
            onClick={fullDiagnosis}
            className="px-3 py-2 rounded text-sm font-medium bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
          >
            🔍 诊断
          </button>
        </div>
        <div className="text-xs text-green-700 flex items-center ml-2">
          🆕 基于img元素的全新导出方法 - 彻底解决html2canvas兼容性问题
          </div>
        </div>


      {/* 🚀 绕过画质损失导出 - 备用 */}
      <div className="hidden">
        <BypassDomExport 
          cardRef={cardRef}
          className="mt-4"
        />
      </div>

      {/* 🎯 精确布局导出 - 备用 */}
      <div className="hidden">
        <LayoutPerfectExport 
          cardRef={cardRef}
          className="mt-4"
        />
      </div>

      {/* 🔧 强制修复器 - 备用 */}
      <div className="hidden">
        <ForceFixExport 
          cardRef={cardRef}
          className="mt-4"
        />
      </div>

      {/* 🔍 问题诊断器 - 备用 */}
      <div className="hidden">
        <DiagnosisExport 
          cardRef={cardRef}
          className="mt-4"
        />
      </div>

      {/* 🔧 DOM增强导出 - 备用 */}
      <div className="hidden">
        <DomEnhancedExport 
          cardRef={cardRef}
          className="mt-4"
        />
      </div>


      {/* 🚀 增强DOM导出 - 备用 */}
      <div className="hidden">
        <EnhancedDomExport 
          cardRef={cardRef}
          className="mt-4"
        />
      </div>

      {/* 🔧 固定尺寸导出 - 备用 */}
      <div className="hidden">
        <FixedSizeExport 
          cardRef={cardRef}
          className="mt-4"
        />
      </div>

      {/* DOM导出调试工具 - 已隐藏 */}
      <div className="hidden">
        <DomExportDebug 
          user={user}
          cardRef={cardRef}
          className="mt-4"
        />
      </div>

      {/* 使用说明 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 点击"上传底图"更换背景图片</p>
        <p>• 拖拽任何文字模块调整位置</p>
        <p>• 在左侧编辑区域修改文字内容和样式</p>
        <p>• 选择业务能力会在名片上显示对应图标和标签</p>
        <p>• 双重导出引擎：Canvas绘制 + DOM保真</p>
      </div>
    </div>
  )
}

