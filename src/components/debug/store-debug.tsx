'use client'

import { useCardStore } from '@/store/card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function StoreDebug() {
  const { 
    textPositions, 
    avatarConfig, 
    textModules, 
    cardData,
    reset,
    hasUnsavedChanges 
  } = useCardStore()

  const resetToDefaults = () => {
    if (confirm('确定要重置所有配置到默认值吗？')) {
      reset()
      window.location.reload()
    }
  }

  return (
    <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
      <h3 className="font-bold mb-2 text-yellow-800">🔧 Store 状态调试</h3>
      
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <strong>头像配置:</strong>
          <pre className="bg-white p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(avatarConfig, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>文字位置:</strong>
          <pre className="bg-white p-2 rounded mt-1 overflow-auto max-h-32">
            {JSON.stringify(textPositions, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>文字模块:</strong>
          <pre className="bg-white p-2 rounded mt-1 overflow-auto max-h-32">
            {JSON.stringify(textModules, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>名片数据:</strong>
          <pre className="bg-white p-2 rounded mt-1 overflow-auto max-h-32">
            {JSON.stringify({
              name: cardData.name,
              title: cardData.title,
              studentsServed: cardData.studentsServed,
              rating: cardData.rating,
              phone: cardData.phone,
              avatarUrl: cardData.avatarUrl
            }, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <Button 
          onClick={resetToDefaults}
          variant="outline"
          size="sm"
          className="bg-red-50 border-red-200 text-red-700"
        >
          重置到默认配置
        </Button>
        
        <div className="text-xs text-yellow-700 flex items-center">
          {hasUnsavedChanges ? '⚠️ 有未保存的更改' : '✅ 配置已保存'}
        </div>
      </div>
    </Card>
  )
}
