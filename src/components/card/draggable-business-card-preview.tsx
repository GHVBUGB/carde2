'use client'

import { User } from '@/lib/types'
import { useState, useRef } from 'react'

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
}

export default function DraggableBusinessCardPreview({ 
  user, 
  textModules,
  textStyles,
  textPositions,
  abilities,
  className, 
  backgroundImage = '/ditu.png',
  onBackgroundUpload,
  onPositionChange
}: DraggableBusinessCardPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showCoordinates, setShowCoordinates] = useState(false)

  // 处理背景图上传
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onBackgroundUpload) {
      onBackgroundUpload(file)
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

  // 拖拽移动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedElement) return

    const rect = e.currentTarget.getBoundingClientRect()
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y

    // 限制在卡片范围内
    const constrainedX = Math.max(0, Math.min(newX, 350 - 100)) // 350是卡片宽度，100是元素最大宽度
    const constrainedY = Math.max(0, Math.min(newY, 500 - 50)) // 500是卡片高度，50是元素最大高度

    if (onPositionChange) {
      onPositionChange(draggedElement, constrainedX, constrainedY)
    }
  }

  // 拖拽结束
  const handleMouseUp = () => {
    setDraggedElement(null)
  }

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
        className={`absolute cursor-move select-none ${
          draggedElement === moduleId ? 'z-50' : 'z-10'
        }`}
        style={{
          left: position.x,
          top: position.y,
          fontSize: `${style.fontSize}px`,
          color: style.color,
          fontWeight: style.fontWeight,
          transform: draggedElement === moduleId ? 'scale(1.05)' : 'scale(1)',
          transition: draggedElement === moduleId ? 'none' : 'transform 0.2s ease'
        }}
        onMouseDown={(e) => handleMouseDown(e, moduleId)}
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 工具栏 */}
      <div className="flex gap-2 p-3 bg-gray-100 rounded-lg">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
        >
          上传底图
        </button>
        <button
          onClick={() => {
            // TODO: 实现导出功能
            console.log('导出名片')
          }}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
        >
          导出名片
        </button>
        <button
          onClick={() => setShowCoordinates(!showCoordinates)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            showCoordinates 
              ? 'bg-orange-500 text-white hover:bg-orange-600' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          {showCoordinates ? '隐藏坐标' : '显示坐标'}
        </button>
        <div className="text-xs text-gray-600 flex items-center">
          拖拽文字模块调整位置
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

      {/* 名片画布 - 可拖拽版本 */}
      <div className="relative">
        <div 
          className="relative w-[350px] h-[500px] mx-auto border border-gray-300 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 头像 - 固定位置 */}
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


          {renderDraggableText(
            'name',
            textModules.name || user.name || 'AHMED AL-FAWAZ',
            textStyles.name,
            textPositions.name,
            showCoordinates
          )}

          {renderDraggableText(
            'title',
            textModules.title || user.title || 'SENIOR LANGUAGE COACH',
            textStyles.title,
            textPositions.title,
            showCoordinates
          )}

          {/* 统计数据 - 无边框横排显示 */}
          <div
            className={`absolute cursor-move select-none ${
              draggedElement === 'studentsServed' ? 'z-50' : 'z-10'
            }`}
            style={{
              left: textPositions.studentsServed.x,
              top: textPositions.studentsServed.y,
              transform: draggedElement === 'studentsServed' ? 'scale(1.05)' : 'scale(1)',
              transition: draggedElement === 'studentsServed' ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'studentsServed')}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div 
                style={{
                  fontSize: `${textStyles.studentsServed?.fontSize || 16}px`,
                  color: textStyles.studentsServed?.color || '#000000',
                  fontWeight: textStyles.studentsServed?.fontWeight || 'bold'
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
                  color: textStyles.studentsServed?.color || '#000000',
                  fontWeight: textStyles.studentsServed?.fontWeight || 'normal'
                }}
              >
                STUDENTS<br />SERVED
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
            className={`absolute cursor-move select-none ${
              draggedElement === 'positiveRating' ? 'z-50' : 'z-10'
            }`}
            style={{
              left: textPositions.positiveRating.x,
              top: textPositions.positiveRating.y,
              transform: draggedElement === 'positiveRating' ? 'scale(1.05)' : 'scale(1)',
              transition: draggedElement === 'positiveRating' ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'positiveRating')}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div 
                style={{
                  fontSize: `${textStyles.positiveRating?.fontSize || 16}px`,
                  color: textStyles.positiveRating?.color || '#000000',
                  fontWeight: textStyles.positiveRating?.fontWeight || 'bold'
                }}
              >
                {textModules.positiveRating}%
              </div>
              <div 
                className="text-[6px] leading-tight"
                style={{
                  color: textStyles.positiveRating?.color || '#000000',
                  fontWeight: textStyles.positiveRating?.fontWeight || 'normal'
                }}
              >
                POSITIVE<br />RATING
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

          {renderDraggableText(
            'phone',
            `电话: ${textModules.phone || user.phone || '050-XXXX-XXAB'}`,
            textStyles.phone,
            textPositions.phone,
            showCoordinates
          )}

          {/* 能力标签 - 四个独立的可拖拽元素，无图标，英文两排显示 */}
          {/* 教师筛选 */}
          <div
            className={`absolute cursor-move select-none ${
              draggedElement === 'teacherSelectionLabel' ? 'z-50' : 'z-10'
            }`}
            style={{
              left: textPositions.teacherSelectionLabel.x,
              top: textPositions.teacherSelectionLabel.y,
              transform: draggedElement === 'teacherSelectionLabel' ? 'scale(1.05)' : 'scale(1)',
              transition: draggedElement === 'teacherSelectionLabel' ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'teacherSelectionLabel')}
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
                {(textModules.teacherSelectionLabel || 'Teacher\nSelection').split('\n').map((line, index, array) => (
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
            className={`absolute cursor-move select-none ${
              draggedElement === 'progressFeedbackLabel' ? 'z-50' : 'z-10'
            }`}
            style={{
              left: textPositions.progressFeedbackLabel.x,
              top: textPositions.progressFeedbackLabel.y,
              transform: draggedElement === 'progressFeedbackLabel' ? 'scale(1.05)' : 'scale(1)',
              transition: draggedElement === 'progressFeedbackLabel' ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'progressFeedbackLabel')}
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
                {(textModules.progressFeedbackLabel || 'Progress\nFeedback').split('\n').map((line, index, array) => (
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
            className={`absolute cursor-move select-none ${
              draggedElement === 'planningLabel' ? 'z-50' : 'z-10'
            }`}
            style={{
              left: textPositions.planningLabel.x,
              top: textPositions.planningLabel.y,
              transform: draggedElement === 'planningLabel' ? 'scale(1.05)' : 'scale(1)',
              transition: draggedElement === 'planningLabel' ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'planningLabel')}
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
                {(textModules.planningLabel || 'Study\nPlan').split('\n').map((line, index, array) => (
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
            className={`absolute cursor-move select-none ${
              draggedElement === 'resourceSharingLabel' ? 'z-50' : 'z-10'
            }`}
            style={{
              left: textPositions.resourceSharingLabel.x,
              top: textPositions.resourceSharingLabel.y,
              transform: draggedElement === 'resourceSharingLabel' ? 'scale(1.05)' : 'scale(1)',
              transition: draggedElement === 'resourceSharingLabel' ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'resourceSharingLabel')}
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
                {(textModules.resourceSharingLabel || 'Learning\nResources').split('\n').map((line, index, array) => (
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
        </div>
      </div>

      {/* 使用说明 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 点击"上传底图"更换背景图片</p>
        <p>• 拖拽任何文字模块调整位置</p>
        <p>• 在左侧编辑区域修改文字内容和样式</p>
        <p>• 选择业务能力会在名片上显示对应图标和标签</p>
        <p>• 点击"导出名片"下载高清图片</p>
      </div>
    </div>
  )
}

