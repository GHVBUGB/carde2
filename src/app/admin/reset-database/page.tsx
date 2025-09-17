'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Database, Trash2, AlertTriangle } from 'lucide-react'

interface ResetResult {
  success: boolean
  message: string
  data?: {
    cleared_tables: string[]
    reset_time: string
    processing_time: number
  }
  error?: string
}

export default function ResetDatabasePage() {
  const [isResetting, setIsResetting] = useState(false)
  const [result, setResult] = useState<ResetResult | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleReset = async () => {
    setIsResetting(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/admin/reset-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      setResult(data)
      
    } catch (error) {
      setResult({
        success: false,
        message: '重置请求失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsResetting(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">数据库重置</h1>
        <p className="text-gray-600">清空所有用户数据和日志记录，重新开始统计</p>
      </div>

      <div className="grid gap-6">
        {/* 警告信息 */}
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>警告：</strong>此操作将永久删除所有用户行为数据和API调用日志，无法恢复！
          </AlertDescription>
        </Alert>

        {/* 重置操作卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              数据库重置操作
            </CardTitle>
            <CardDescription>
              此操作将清空以下数据表：
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">将被清空的数据表：</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li><code>api_logs</code> - API调用日志记录</li>
                  <li><code>usage_stats</code> - 用户使用统计数据</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-800">重置后将开始记录：</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-600">
                  <li>用户注册时间和信息</li>
                  <li>抠图操作次数和结果</li>
                  <li>API调用统计和响应时间</li>
                  <li>用户行为分析数据</li>
                </ul>
              </div>

              {!showConfirm ? (
                <Button 
                  onClick={() => setShowConfirm(true)}
                  variant="destructive"
                  className="w-full"
                  disabled={isResetting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  重置数据库
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-red-600 font-semibold">
                    确认要重置数据库吗？此操作不可撤销！
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleReset}
                      variant="destructive"
                      className="flex-1"
                      disabled={isResetting}
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          重置中...
                        </>
                      ) : (
                        '确认重置'
                      )}
                    </Button>
                    <Button 
                      onClick={() => setShowConfirm(false)}
                      variant="outline"
                      className="flex-1"
                      disabled={isResetting}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 结果显示 */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className={result.success ? 'text-green-600' : 'text-red-600'}>
                {result.success ? '重置成功' : '重置失败'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p>{result.message}</p>
                
                {result.success && result.data && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">重置详情：</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>清空表: {result.data.cleared_tables.join(', ')}</li>
                      <li>重置时间: {new Date(result.data.reset_time).toLocaleString()}</li>
                      <li>处理耗时: {result.data.processing_time}ms</li>
                    </ul>
                  </div>
                )}
                
                {!result.success && result.error && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">错误信息：</h4>
                    <p className="text-sm text-red-700">{result.error}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}