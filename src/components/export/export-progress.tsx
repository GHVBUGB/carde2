import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ExportProgressProps {
  isVisible: boolean
  progress: number
  currentTask: string
  totalTasks: number
  onCancel: () => void
}

export default function ExportProgress({ 
  isVisible, 
  progress, 
  currentTask, 
  totalTasks, 
  onCancel 
}: ExportProgressProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96 mx-4">
        <CardHeader>
          <CardTitle>导出进度</CardTitle>
          <CardDescription>
            正在处理您的导出请求
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-brand-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 进度信息 */}
          <div className="text-center">
            <div className="text-sm text-brand-dark mb-1">
              {currentTask}{dots}
            </div>
            <div className="text-xs text-brand-gray">
              {Math.round(progress)}% 完成 ({totalTasks} 个任务)
            </div>
          </div>

          {/* 取消按钮 */}
          <div className="flex justify-center">
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              取消导出
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


