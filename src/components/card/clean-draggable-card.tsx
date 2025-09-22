'use client'

import { User } from '@/lib/types'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import SimpleDomExport from '@/components/export/simple-dom-export'

interface TextModules {
  companyName: string
  name: string
  title: string
  studentsServed: number
  studentsServedLabel: string
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
  studentsServedLabel: { fontSize: number; color: string; fontWeight: string }
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
  studentsServedLabel: { x: number; y: number }
  positiveRating: { x: number; y: number }
  phone: { x: number; y: number }
  teacherSelectionLabel: { x: number; y: number }
  progressFeedbackLabel: { x: number; y: number }
  planningLabel: { x: number; y: number }
  resourceSharingLabel: { x: number; y: number }
}

interface CleanDraggableCardProps {
  user: User
  avatarConfig: {
    size: number
    position: { x: number; y: number }
  }
  textModules: TextModules
  textStyles: TextStyles
  textPositions: TextPositions
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
}

export default function CleanDraggableCard({ 
  user, 
  avatarConfig,
  textModules,
  textStyles,
  textPositions,
  abilities,
  className, 
  backgroundImage = '/底图.png',
  onBackgroundUpload,
  onPositionChange,
  onAvatarPositionChange
}: CleanDraggableCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showCoordinates, setShowCoordinates] = useState(false)

  // 🎯 拖拽相关函数
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault()
    setDraggedElement(elementId)
    
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedElement || !cardRef.current) return

    const cardRect = cardRef.current.getBoundingClientRect()
    const newX = e.clientX - cardRect.left - dragOffset.x
    const newY = e.clientY - cardRect.top - dragOffset.y

    // 限制在卡片区域内
    const clampedX = Math.max(0, Math.min(350 - 50, newX))
    const clampedY = Math.max(0, Math.min(500 - 20, newY))

    if (draggedElement === 'avatar' && onAvatarPositionChange) {
      onAvatarPositionChange(clampedX, clampedY)
    } else if (onPositionChange) {
      onPositionChange(draggedElement, clampedX, clampedY)
    }
  }

  const handleMouseUp = () => {
    setDraggedElement(null)
  }

  const handleAvatarMouseDown = (e: React.MouseEvent) => {
    handleMouseDown(e, 'avatar')
  }

  // 🎯 背景图片上传
  const handleBackgroundClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onBackgroundUpload) {
      onBackgroundUpload(file)
    }
  }

  // 🎯 渲染拖拽文字元素
  const renderDraggableText = (
    id: keyof TextPositions,
    text: string | number,
    style: { fontSize: number; color: string; fontWeight: string },
    position: { x: number; y: number },
    showCoords: boolean = false
  ) => (
    <div
      key={id}
      className="absolute cursor-move select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        fontSize: `${style.fontSize}px`,
        color: style.color,
        fontWeight: style.fontWeight,
        zIndex: draggedElement === id ? 1000 : 10,
        whiteSpace: 'pre-line',
        lineHeight: '1.2'
      }}
      onMouseDown={(e) => handleMouseDown(e, id)}
    >
      {text}
      
      {showCoords && (
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

  return (
    <div className={className}>
      {/* 文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 控制按钮 */}
      <div className="mb-4 flex gap-2">
        <Button
          onClick={handleBackgroundClick}
          variant="outline"
          size="sm"
        >
          上传底图
        </Button>
        
        <Button
          onClick={() => setShowCoordinates(!showCoordinates)}
          variant="outline"
          size="sm"
        >
          {showCoordinates ? '隐藏坐标' : '显示坐标'}
        </Button>
      </div>

      {/* 名片画布 */}
      <div 
        ref={cardRef}
        data-card-ref="true"
        className="relative rounded-2xl overflow-hidden shadow-2xl cursor-crosshair"
        style={{
          width: '350px',
          height: '500px',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 公司名 */}
        {renderDraggableText(
          'companyName',
          textModules.companyName,
          textStyles.companyName,
          textPositions.companyName,
          showCoordinates
        )}

        {/* 头像 - 更大尺寸，白色边框 */}
        {user.avatar_url && (
          <div 
            className="absolute cursor-move select-none"
            style={{
              left: `${avatarConfig.position.x}px`,
              top: `${avatarConfig.position.y}px`,
              width: `${avatarConfig.size}px`,
              height: `${avatarConfig.size}px`,
              zIndex: 10
            }}
            onMouseDown={handleAvatarMouseDown}
          >
              <div 
                className="w-full h-full rounded-full overflow-hidden"
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

        {/* 姓名 */}
        {renderDraggableText(
          'name',
          textModules.name || 'أحمد',
          textStyles.name,
          textPositions.name,
          showCoordinates
        )}

        {/* 职位 */}
        {renderDraggableText(
          'title',
          textModules.title || user.title || 'شريك النمو الرئيسي',
          textStyles.title,
          textPositions.title,
          showCoordinates
        )}

        {/* 数据统计 - 黄色圆形背景 */}
        <div className="absolute" style={{ left: '50%', top: '320px', transform: 'translateX(-50%)' }}>
          <div className="flex gap-8">
            {/* 学生数量 - 黄色圆形背景 */}
            <div 
              className="relative w-16 h-16 bg-yellow-400 rounded-full flex flex-col items-center justify-center cursor-move select-none"
              onMouseDown={(e) => handleMouseDown(e, 'studentsServed')}
            >
              <div className="text-center">
                <div 
                  className="font-bold leading-none"
                  style={{
                    fontSize: `${textStyles.studentsServed.fontSize}px`,
                    color: '#000000'
                  }}
                >
                  {textModules.studentsServed >= 1000 
                    ? `${Math.floor(textModules.studentsServed / 1000)}K+`
                    : textModules.studentsServed
                  }
                </div>
                <div className="text-xs leading-tight mt-1" style={{ fontSize: '8px', color: '#000000' }}>
                  STUDENTS<br />SERVED
                </div>
              </div>
              {showCoordinates && (
                <div className="absolute top-full left-0 text-xs text-gray-600 bg-white bg-opacity-80 px-1 rounded">
                  ({Math.round(textPositions.studentsServed.x)}, {Math.round(textPositions.studentsServed.y)})
                </div>
              )}
            </div>

            {/* 评分 - 黄色圆形背景 */}
            <div 
              className="relative w-16 h-16 bg-yellow-400 rounded-full flex flex-col items-center justify-center cursor-move select-none"
              onMouseDown={(e) => handleMouseDown(e, 'positiveRating')}
            >
              <div className="text-center">
                <div 
                  className="font-bold leading-none"
                  style={{
                    fontSize: `${textStyles.positiveRating.fontSize}px`,
                    color: '#000000'
                  }}
                >
                  {textModules.positiveRating}%
                </div>
                <div className="text-xs leading-tight mt-1" style={{ fontSize: '8px', color: '#000000' }}>
                  POSITIVE<br />RATING
                </div>
              </div>
              {showCoordinates && (
                <div className="absolute top-full left-0 text-xs text-gray-600 bg-white bg-opacity-80 px-1 rounded">
                  ({Math.round(textPositions.positiveRating.x)}, {Math.round(textPositions.positiveRating.y)})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 业务能力图标区域 */}
        <div className="absolute" style={{ left: '50%', top: '400px', transform: 'translateX(-50%)' }}>
          <div className="flex gap-6">
            {/* 图标占位符 - 这里应该是你的业务能力图标 */}
            <div className="w-8 h-8 bg-gray-200 rounded opacity-50"></div>
            <div className="w-8 h-8 bg-gray-200 rounded opacity-50"></div>
            <div className="w-8 h-8 bg-gray-200 rounded opacity-50"></div>
            <div className="w-8 h-8 bg-gray-200 rounded opacity-50"></div>
          </div>
        </div>

    {/* 电话号码 - 黄色背景条（固定位置，不可拖动） */}
    <div
      className="absolute select-none"
      style={{ left: '50%', bottom: '40px', transform: 'translateX(-50%)' }}
    >
          <div 
            className="bg-yellow-400 px-8 py-2 text-center font-bold"
            style={{
              fontSize: `${textStyles.phone.fontSize}px`,
              color: '#000000',
              whiteSpace: 'nowrap',
              wordWrap: 'normal',
              wordBreak: 'normal',
              overflow: 'hidden',
              maxWidth: '300px'
            }}
            data-module-id="phone"
            ref={(el) => {
              if (!el) return
              // 动态调整字体大小以适应容器
              const phoneText = `هاتف: ${textModules.phone || ''}`
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
            <div className="absolute top-full left-0 text-xs text-gray-600 bg-white bg-opacity-80 px-1 rounded">
              ({Math.round(textPositions.phone.x)}, {Math.round(textPositions.phone.y)})
            </div>
          )}
        </div>

        {/* 业务能力标签 */}
        {abilities.teacherScreening && renderDraggableText(
          'teacherSelectionLabel',
          textModules.teacherSelectionLabel,
          textStyles.teacherSelectionLabel,
          textPositions.teacherSelectionLabel,
          showCoordinates
        )}

        {abilities.feedbackAbility && renderDraggableText(
          'progressFeedbackLabel',
          textModules.progressFeedbackLabel,
          textStyles.progressFeedbackLabel,
          textPositions.progressFeedbackLabel,
          showCoordinates
        )}

        {abilities.planningAbility && renderDraggableText(
          'planningLabel',
          textModules.planningLabel,
          textStyles.planningLabel,
          textPositions.planningLabel,
          showCoordinates
        )}

        {abilities.resourceSharing && renderDraggableText(
          'resourceSharingLabel',
          textModules.resourceSharingLabel,
          textStyles.resourceSharingLabel,
          textPositions.resourceSharingLabel,
          showCoordinates
        )}
      </div>

      {/* 导出功能 */}
      <SimpleDomExport 
        cardRef={cardRef}
        className="mt-4"
      />

      {/* 使用说明 */}
      <div className="text-xs text-gray-500 space-y-1 mt-4">
        <p>• 点击"上传底图"更换背景图片</p>
        <p>• 拖拽任何文字模块调整位置</p>
        <p>• 在左侧编辑区域修改文字内容和样式</p>
        <p>• 使用下方的导出功能保存名片</p>
      </div>
    </div>
  )
}
