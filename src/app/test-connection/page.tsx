'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestConnectionPage() {
  const [status, setStatus] = useState<string>('未测试')
  const [details, setDetails] = useState<any>(null)

  const testConnection = async () => {
    setStatus('测试中...')
    try {
      // 测试基本连接
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        setStatus('连接失败')
        setDetails(error)
      } else {
        setStatus('连接成功')
        setDetails({ message: '数据库连接正常', userCount: data })
      }
    } catch (err) {
      setStatus('连接错误')
      setDetails(err)
    }
  }

  const testAuth = async () => {
    setStatus('测试认证中...')
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        setStatus('认证测试失败')
        setDetails(error)
      } else {
        setStatus('认证测试成功')
        setDetails({ message: '认证系统正常', user })
      }
    } catch (err) {
      setStatus('认证错误')
      setDetails(err)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase 连接测试</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            测试数据库连接
          </button>
          
          <button
            onClick={testAuth}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            测试认证系统
          </button>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">测试状态: {status}</h2>
          
          {details && (
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800">环境变量检查:</h3>
          <ul className="mt-2 text-sm text-yellow-700">
            <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置'}</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}



