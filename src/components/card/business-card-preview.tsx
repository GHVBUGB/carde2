'use client'

import { User } from '@/lib/types'
import { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

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

interface BusinessCardPreviewProps {
  user: User
  textModules: TextModules
  textStyles?: TextStyles
  abilities: {
    teacherScreening: boolean
    feedbackAbility: boolean
    planningAbility: boolean
    resourceSharing: boolean
  }
  className?: string
  backgroundImage?: string
  onBackgroundUpload?: (file: File) => void
}

export default function BusinessCardPreview({ 
  user, 
  textModules,
  textStyles,
  abilities,
  className, 
  backgroundImage = '/底图.png',
  onBackgroundUpload 
}: BusinessCardPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportOptions(false)
      }
    }

    if (showExportOptions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportOptions])

  // 处理背景图上传
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onBackgroundUpload) {
      onBackgroundUpload(file)
    }
  }

  // 🎯 全新Canvas导出功能 - 零变形、高质量
  const handleExport = async (format: 'png' | 'jpg' = 'png') => {
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

      const scale = format === 'png' ? 3 : 2 // PNG用3倍分辨率，JPG用2倍
      const width = 350
      const height = 500
      
      // 设置Canvas尺寸
      canvas.width = width * scale
      canvas.height = height * scale
      
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
              // 计算cover效果的绘制参数
              const aspectRatio = img.width / img.height
              const canvasAspectRatio = canvas.width / canvas.height
              
              let drawWidth = canvas.width
              let drawHeight = canvas.height
              let drawX = 0
              let drawY = 0

              if (aspectRatio > canvasAspectRatio) {
                drawWidth = canvas.height * aspectRatio
                drawX = -(drawWidth - canvas.width) / 2
              } else {
                drawHeight = canvas.width / aspectRatio
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
              const avatarX = 127 * scale // 127px from left
              const avatarY = 64 * scale  // 64px from top
              const avatarSize = 96 * scale
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
      
      // 4. 绘制文字内容
      const drawText = (text: string, x: number, y: number, fontSize: number, color: string, fontWeight: string = 'normal') => {
        ctx.save()
        ctx.font = `${fontWeight} ${fontSize * scale}px Arial, sans-serif`
        ctx.fillStyle = color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = 1 * scale
        ctx.shadowOffsetY = 1 * scale
        ctx.fillText(text, x * scale, y * scale)
        ctx.restore()
      }

      const drawMultilineText = (text: string, x: number, y: number, fontSize: number, color: string, lineHeight = 1.2) => {
        const lines = text.split('\n')
        lines.forEach((line, index) => {
          const lineY = y + (index * fontSize * lineHeight)
          drawText(line, x, lineY, fontSize, color)
        })
      }

      // 姓名
      drawText(
        textModules.name || user.name || 'أحمد',
        152, 244, 20, '#000000', 'bold'
      )

      // 职位
      drawText(
        textModules.title || user.title || 'شريك النمو الرئيسي',
        124, 270, 14, '#666666'
      )

      // 统计数据
      const studentsText = textModules.studentsServed >= 1000 
        ? `${Math.floor(textModules.studentsServed / 1000)}K+`
        : textModules.studentsServed.toString()
      
      drawText(studentsText, 143, 288, 16, '#000000', 'bold')
      drawMultilineText('STUDENTS\nSERVED', 143, 305, 6, '#000000')
      
      drawText(`${textModules.positiveRating}%`, 207, 288, 16, '#000000', 'bold')
      drawMultilineText('POSITIVE\nRATING', 207, 305, 6, '#000000')

      // 业务能力标签
      const abilities = [
        { text: 'اختيار\nالمعلم', x: 110, y: 380 },
        { text: 'تعليقات\nالتقدم', x: 240, y: 380 },
        { text: 'خطة\nالدراسة', x: 110, y: 420 },
        { text: 'موارد\nالتعلم', x: 240, y: 420 }
      ]

      abilities.forEach(ability => {
        drawMultilineText(ability.text, ability.x, ability.y, 8, '#666666', 1.2)
      })

      // 电话
      drawText(
        `电话: ${textModules.phone || user.phone || '050-XXXX-XXAB'}`,
        106, 430, 14, '#000000', 'bold'
      )

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

      const filename = `${user.name || 'business-card'}-名片-新导出.${format}`
      saveAs(blob, filename)
      
      console.log('✅ 新Canvas导出成功！')
      alert(`🎉 导出成功！\n格式: ${format.toUpperCase()}\n分辨率: ${width * scale}x${height * scale}\n特点: 零变形、高质量`)

    } catch (error) {
      console.error('❌ 新Canvas导出失败:', error)
      alert('导出失败: ' + (error as Error).message)
    } finally {
      setExporting(false)
      setShowExportOptions(false)
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 工具栏 - 已隐藏 */}
      <div className="flex gap-2 p-3 bg-gray-100 rounded-lg hidden">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
        >
          上传底图
        </button>
        
        {/* 测试按钮 */}
        <button
          onClick={() => {
            console.log('测试按钮被点击')
            alert('测试按钮工作正常')
          }}
          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
        >
          测试
        </button>
        
        {/* 直接导出按钮 - 简化版本 */}
        <button
          onClick={() => {
            console.log('直接导出按钮被点击')
            handleExport('png')
          }}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
        >
          直接导出PNG
        </button>
        
        {/* 导出按钮和选项 */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => {
              console.log('导出按钮被点击，当前状态:', showExportOptions)
              setShowExportOptions(!showExportOptions)
            }}
            disabled={exporting}
            className={`px-3 py-1 text-white rounded text-sm transition-colors ${
              exporting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {exporting ? '导出中...' : '导出名片 ▼'}
          </button>
          
          {/* 导出选项下拉菜单 */}
          {showExportOptions && !exporting && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => {
                  console.log('新Canvas PNG导出按钮被点击')
                  handleExport('png')
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-t-lg"
              >
                🎯 PNG (零变形·超高清)
              </button>
              <button
                onClick={() => {
                  console.log('新Canvas JPG导出按钮被点击')
                  handleExport('jpg')
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-b-lg"
              >
                ⚡ JPG (零变形·小文件)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundUpload}
        className="hidden"
      />

      {/* 名片画布 - 基于图片设计 */}
      <div 
        ref={cardRef}
        data-card-ref="true"
        className="relative w-[350px] h-[500px] mx-auto border border-gray-300 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover', // 恢复为cover以正确显示底图
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >

          {/* 头像 - 中上部位置 */}
          {user.avatar_url && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={user.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* 姓名 - 头像下方 */}
          <div className="absolute top-44 left-1/2 transform -translate-x-1/2 text-center">
            <h1 
              className="mb-1"
              style={{
                fontSize: `${textStyles?.name?.fontSize || 20}px`,
                color: textStyles?.name?.color || '#000000',
                fontWeight: textStyles?.name?.fontWeight || 'bold'
              }}
            >
              {textModules.name || user.name || 'أحمد'}
            </h1>
            {/* 职位头衔 */}
            <p 
              style={{
                fontSize: `${textStyles?.title?.fontSize || 14}px`,
                color: textStyles?.title?.color || '#666666',
                fontWeight: textStyles?.title?.fontWeight || 'normal'
              }}
            >
              {textModules.title || user.title || 'شريك النمو الرئيسي'}
            </p>
          </div>

          {/* 数据统计 - 无边框居中显示 */}
          <div className="absolute top-72 left-1/2 transform -translate-x-1/2 flex justify-center">
            {/* 学员数量 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div 
                style={{
                  fontSize: `${textStyles?.studentsServed?.fontSize || 16}px`,
                  color: textStyles?.studentsServed?.color || '#000000',
                  fontWeight: textStyles?.studentsServed?.fontWeight || 'bold'
                }}
              >
                {textModules.studentsServed >= 1000 
                  ? `${Math.floor(textModules.studentsServed / 1000)}K+`
                  : textModules.studentsServed
                }
              </div>
              <div 
                className="text-[6px] leading-tight"
                style={{
                  color: textStyles?.studentsServed?.color || '#000000',
                  fontWeight: textStyles?.studentsServed?.fontWeight || 'normal'
                }}
              >
                STUDENTS<br />SERVED
              </div>
            </div>
            
          </div>

          {/* 业务能力标签区域 - 无图标，英文两排显示 */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-80">
            <div className="grid grid-cols-2 gap-4 px-4">
              {/* 第一行：教师筛选和进度反馈 */}
              <div className="flex flex-col items-center text-center">
                <div 
                  className="leading-tight text-center"
                  style={{
                    fontSize: `${textStyles?.teacherSelectionLabel?.fontSize || 8}px`,
                    color: textStyles?.teacherSelectionLabel?.color || '#666666',
                    fontWeight: textStyles?.teacherSelectionLabel?.fontWeight || 'normal'
                  }}
                >
                  {(textModules.teacherSelectionLabel || 'اختيار\nالمعلم').split('\n').map((line, index, array) => (
                    <span key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center text-center">
                <div 
                  className="leading-tight text-center"
                  style={{
                    fontSize: `${textStyles?.progressFeedbackLabel?.fontSize || 8}px`,
                    color: textStyles?.progressFeedbackLabel?.color || '#666666',
                    fontWeight: textStyles?.progressFeedbackLabel?.fontWeight || 'normal'
                  }}
                >
                  {(textModules.progressFeedbackLabel || 'تعليقات\nالتقدم').split('\n').map((line, index, array) => (
                    <span key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>

              {/* 第二行：学习计划和学习资源 */}
              <div className="flex flex-col items-center text-center">
                <div 
                  className="leading-tight text-center"
                  style={{
                    fontSize: `${textStyles?.planningLabel?.fontSize || 8}px`,
                    color: textStyles?.planningLabel?.color || '#666666',
                    fontWeight: textStyles?.planningLabel?.fontWeight || 'normal'
                  }}
                >
                  {(textModules.planningLabel || 'خطة\nالدراسة').split('\n').map((line, index, array) => (
                    <span key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center text-center">
                <div 
                  className="leading-tight text-center"
                  style={{
                    fontSize: `${textStyles?.resourceSharingLabel?.fontSize || 8}px`,
                    color: textStyles?.resourceSharingLabel?.color || '#666666',
                    fontWeight: textStyles?.resourceSharingLabel?.fontWeight || 'normal'
                  }}
                >
                  {(textModules.resourceSharingLabel || 'موارد\nالتعلم').split('\n').map((line, index, array) => (
                    <span key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 联系方式 - 底部（保持原样式，只优化字体适配） */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="text-center">
              <span 
                style={{
                  fontSize: `${textStyles?.phone?.fontSize || 14}px`,
                  color: textStyles?.phone?.color || '#000000',
                  fontWeight: textStyles?.phone?.fontWeight || 'bold',
                  whiteSpace: 'nowrap',
                  wordWrap: 'normal',
                  wordBreak: 'normal',
                  display: 'inline-block',
                  overflow: 'hidden',
                  maxWidth: '300px'
                }}
                data-module-id="phone"
                ref={(el) => {
                  if (!el) return
                  // 动态调整字体大小以适应容器
                  const phoneText = `هاتف: ${textModules.phone || user.phone || '050-XXXX-XXAB'}`
                  el.textContent = phoneText
                  
                  let fontSize = textStyles?.phone?.fontSize || 14
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
            </div>
          </div>
        </div>


      {/* 使用说明 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>🎯 <strong>DOM导出工具</strong> - 专门解决导出编移和近框问题</p>
        <p>• PNG保真: 完全保真，最高质量，适合高要求场景</p>
        <p>• JPG兼容: 文件较小，兼容性佳，适合分享使用</p>
        <p>• DOM-to-image: 保真样式，兼容性好，适合复杂布局</p>
      </div>
    </div>
  )
}
