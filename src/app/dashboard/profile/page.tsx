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
      alert('الاسم لا يمكن أن يكون فارغاً')
      return
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      alert('يرجى إدخال رقم هاتف صحيح')
      return
    }

    if (formData.rating < 0 || formData.rating > 5) {
      alert('يجب أن يكون معدل التقييم بين 0-5')
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
      alert('تم تحديث المعلومات الشخصية بنجاح')

    } catch (error) {
      console.error('Update failed:', error)
      alert('فشل التحديث، يرجى المحاولة لاحقاً')
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
        <h1 className="text-2xl font-bold text-brand-dark mb-2" dir="rtl">الإعدادات الشخصية</h1>
        <p className="text-brand-gray" dir="rtl">
          إدارة معلوماتك الشخصية وإعدادات الحساب
        </p>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle dir="rtl">المعلومات الأساسية</CardTitle>
          <CardDescription dir="rtl">
            تحديث ملفك الشخصي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2" dir="rtl">
              البريد الإلكتروني *
            </label>
            <Input
              value={user.email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-brand-gray mt-1" dir="rtl">
              لا يمكن تعديل عنوان البريد الإلكتروني
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2" dir="rtl">
              الاسم *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="أدخل اسمك"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2" dir="rtl">
              المسمى الوظيفي
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
            <label className="block text-sm font-medium text-brand-dark mb-2" dir="rtl">
              رقم الاتصال
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="أدخل رقم الاتصال"
            />
          </div>
        </CardContent>
      </Card>

      {/* 业绩信息 */}
      <Card>
        <CardHeader>
          <CardTitle dir="rtl">معلومات الأداء</CardTitle>
          <CardDescription dir="rtl">
            عرض نتائج عملك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2" dir="rtl">
              عدد الطلاب المخدومين
            </label>
            <Input
              type="number"
              value={formData.studentsServed}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                studentsServed: parseInt(e.target.value) || 0 
              }))}
              placeholder="أدخل إجمالي الطلاب المخدومين"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2" dir="rtl">
              معدل التقييم (0-5.0)
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
              placeholder="أدخل معدل التقييم"
            />
          </div>
        </CardContent>
      </Card>

      {/* 账户信息 */}
      <Card>
        <CardHeader>
          <CardTitle dir="rtl">معلومات الحساب</CardTitle>
          <CardDescription dir="rtl">
            عرض حالة حسابك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-gray" dir="rtl">وقت التسجيل</span>
              <span className="text-sm font-medium">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-gray" dir="rtl">آخر تحديث</span>
              <span className="text-sm font-medium">
                {user.updated_at ? new Date(user.updated_at).toLocaleDateString('zh-CN') : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-gray" dir="rtl">حالة الحساب</span>
              <span className="badge-success" dir="rtl">طبيعي</span>
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
          إعادة تعيين
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>
    </div>
  )
}
