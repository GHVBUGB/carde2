import { useState, useRef } from 'react'
import { User } from '@/lib/types'

interface TextElement {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fontWeight: string
}

interface BusinessCardPreviewProps {
  user: User
  className?: string
  backgroundImage?: string
  onBackgroundUpload?: (file: File) => void
}

export default function BusinessCardPreview({ 
  user, 
  className, 
  backgroundImage = '/底图.png',
  onBackgroundUpload 
}: BusinessCardPreviewProps) {
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // 添加文字模块
  const addTextElement = () => {
    const newElement: TextElement = {
      id: Date.now().toString(),
      text: '双击编辑文字',
      x: 100,
      y: 100,
      fontSize: 16,
      color: '#000000',
      fontWeight: 'normal'
    }
    setTextElements([...textElements, newElement])
  }

  // 更新文字内容
  const updateTextContent = (id: string, newText: string) => {
    setTextElements(elements => 
      elements.map(el => el.id === id ? { ...el, text: newText } : el)
    )
  }

  // 更新文字样式
  const updateTextStyle = (id: string, updates: Partial<TextElement>) => {
    setTextElements(elements => 
      elements.map(el => el.id === id ? { ...el, ...updates } : el)
    )
  }

  // 开始拖拽
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    setSelectedElement(elementId)
    
    const element = textElements.find(el => el.id === elementId)
    if (!element || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y
    })
  }

  // 拖拽移动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedElement || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y

    updateTextStyle(selectedElement, { x: newX, y: newY })
  }

  // 结束拖拽
  const handleMouseUp = () => {
    setSelectedElement(null)
  }

  // 删除文字元素
  const deleteElement = (id: string) => {
    setTextElements(elements => elements.filter(el => el.id !== id))
  }

  // 处理背景图上传
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onBackgroundUpload) {
      onBackgroundUpload(file)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 工具栏 */}
      <div className="flex gap-2 p-3 bg-gray-100 rounded-lg">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          上传底图
        </button>
        <button
          onClick={addTextElement}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          添加文字
        </button>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundUpload}
        className="hidden"
      />

      {/* 名片画布 */}
      <div className="relative">
        <div 
          ref={canvasRef}
          className="relative w-[350px] h-[500px] mx-auto border border-gray-300 rounded-2xl overflow-hidden shadow-2xl cursor-crosshair"
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
          {/* 渲染文字元素 */}
          {textElements.map((element) => (
            <div
              key={element.id}
              className={`absolute cursor-move select-none ${
                selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                left: element.x,
                top: element.y,
                fontSize: element.fontSize,
                color: element.color,
                fontWeight: element.fontWeight,
                minWidth: '20px',
                minHeight: '20px'
              }}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              onDoubleClick={(e) => {
                e.stopPropagation()
                const newText = prompt('编辑文字:', element.text)
                if (newText !== null) {
                  updateTextContent(element.id, newText)
                }
              }}
            >
              {element.text}
              
              {/* 删除按钮 */}
              {selectedElement === element.id && (
                <button
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteElement(element.id)
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 文字样式控制面板 */}
        {selectedElement && (
          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <h4 className="font-medium mb-3">文字样式</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">字体大小</label>
                <input
                  type="range"
                  min="10"
                  max="48"
                  value={textElements.find(el => el.id === selectedElement)?.fontSize || 16}
                  onChange={(e) => updateTextStyle(selectedElement, { fontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">颜色</label>
                <input
                  type="color"
                  value={textElements.find(el => el.id === selectedElement)?.color || '#000000'}
                  onChange={(e) => updateTextStyle(selectedElement, { color: e.target.value })}
                  className="w-full h-8"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">字体粗细</label>
                <select
                  value={textElements.find(el => el.id === selectedElement)?.fontWeight || 'normal'}
                  onChange={(e) => updateTextStyle(selectedElement, { fontWeight: e.target.value })}
                  className="w-full p-1 border rounded"
                >
                  <option value="normal">正常</option>
                  <option value="bold">粗体</option>
                  <option value="lighter">细体</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 点击"上传底图"更换背景图片</p>
        <p>• 点击"添加文字"创建新的文字模块</p>
        <p>• 拖拽文字可以移动位置</p>
        <p>• 双击文字可以编辑内容</p>
        <p>• 选中文字后可以调整样式</p>
      </div>
    </div>
  )
}
