'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase/client'
import { isValidPhone } from '@/lib/utils'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    title: user?.title || '',
    studentsServed: user?.students_served || 0,
    rating: user?.rating || 0,
  })

  const handleSave = async () => {
    if (!user) return

    // 验证数据
    if (!formData.name.trim()) {
      alert('姓名不能为空')
      return
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      alert('请输入有效的手机号')
      return
    }

    if (formData.rating < 0 || formData.rating > 5) {
      alert('好评率必须在0-5之间')
      return
    }

    setLoading(true)
    try {
      const updates = {
        name: formData.name.trim(),
        phone: formData.phone || null,
        title: formData.title || null,
        students_served: formData.studentsServed,
        rating: formData.rating,
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      updateUser(updates as any)
      alert('个人信息更新成功')

    } catch (error) {
      console.error('Update failed:', error)
      alert('更新失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const titleOptions = [
    { value: '', label: 'يرجى اختيار المنصب' },
    { value: 'شريك النمو الرئيسي', label: 'شريك النمو الرئيسي' },
    { value: 'مستشار النمو الذهبي', label: 'مستشار النمو الذهبي' },
    { value: 'مسؤول الخدمة خمس نجوم', label: 'مسؤول الخدمة خمس نجوم' },
    { value: 'مسؤول الملاحة التعليمية', label: 'مسؤول الملاحة التعليمية' },
  ]

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark mb-2">个人设置</h1>
        <p className="text-brand-gray">
          管理您的个人信息和账户设置
        </p>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>
            更新您的个人资料
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2">
              邮箱 *
            </label>
            <Input
              value={user.email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-brand-gray mt-1">
              邮箱地址无法修改
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2">
              姓名 *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入您的姓名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2">
              职位头衔
            </label>
            <select
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus-brand"
            >
              {titleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2">
              联系电话
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="请输入联系电话"
            />
          </div>
        </CardContent>
      </Card>

      {/* 业绩信息 */}
      <Card>
        <CardHeader>
          <CardTitle>业绩信息</CardTitle>
          <CardDescription>
            展示您的工作成果
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2">
              已服务学员数
            </label>
            <Input
              type="number"
              value={formData.studentsServed}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                studentsServed: parseInt(e.target.value) || 0 
              }))}
              placeholder="请输入已服务的学员总数"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2">
              好评率 (0-5.0)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                rating: parseFloat(e.target.value) || 0 
              }))}
              placeholder="请输入好评率"
            />
          </div>
        </CardContent>
      </Card>

      {/* 账户信息 */}
      <Card>
        <CardHeader>
          <CardTitle>账户信息</CardTitle>
          <CardDescription>
            查看您的账户状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-gray">注册时间</span>
              <span className="text-sm font-medium">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-gray">最后更新</span>
              <span className="text-sm font-medium">
                {user.updated_at ? new Date(user.updated_at).toLocaleDateString('zh-CN') : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-gray">账户状态</span>
              <span className="badge-success">正常</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={() => {
            setFormData({
              name: user?.name || '',
              phone: user?.phone || '',
              title: user?.title || '',
              studentsServed: user?.students_served || 0,
              rating: user?.rating || 0,
            })
          }}
        >
          重置
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? '保存中...' : '保存更改'}
        </Button>
      </div>
    </div>
  )
}
