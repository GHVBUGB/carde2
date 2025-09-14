'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth'
import { useCardStore } from '@/store/card'
import { supabase } from '@/lib/supabase/client'
import BusinessCardPreview from '@/components/card/business-card-preview'
import AvatarUpload from '@/components/editor/avatar-upload'
import AbilitiesSelector from '@/components/editor/abilities-selector'
import TextModulesEditor from '@/components/editor/text-modules-editor'

export default function EditorPage() {
  const { user, updateUser } = useAuthStore()
  const { cardData, updateCardData, textModules, updateTextModules, textStyles, updateTextStyles, markAsSaved, hasUnsavedChanges } = useCardStore()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState('/ditu.png')

  useEffect(() => {
    if (user && !cardData.name) { // 只在初始化时执行一次
      // 初始化名片数据
      updateCardData({
        name: user.name || '',
        title: user.title || '',
        email: user.email || '',
        phone: user.phone || '',
        studentsServed: user.students_served || 0,
        rating: user.rating || 0,
        avatarUrl: user.avatar_url || '',
        teacherScreening: user.teacher_screening || false,
        feedbackAbility: user.feedback_ability || false,
        planningAbility: user.planning_ability || false,
        resourceSharing: user.resource_sharing || false,
      })
      
      // 初始化文字模块数据
      updateTextModules({
        name: user.name || 'AHMED AL-FAWAZ',
        title: user.title || 'SENIOR LANGUAGE COACH',
        phone: user.phone || '050-XXXX-XXAB',
        studentsServed: user.students_served || 5000,
        positiveRating: Math.round((user.rating || 0) * 20) || 99, // 转换5分制为百分制
      })
    }
  }, [user]) // 移除其他依赖项避免循环

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const updates = {
        name: cardData.name,
        title: cardData.title as any,
        phone: cardData.phone,
        students_served: cardData.studentsServed,
        rating: cardData.rating,
        teacher_screening: cardData.teacherScreening,
        feedback_ability: cardData.feedbackAbility,
        planning_ability: cardData.planningAbility,
        resource_sharing: cardData.resourceSharing,
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // 更新本地状态
      updateUser(updates)
      markAsSaved()

      // 记录更新统计
      await supabase
        .from('usage_stats')
        .insert({
          user_id: user.id,
          action_type: 'edit_profile',
          details: { fields: Object.keys(updates) },
        })

    } catch (error) {
      console.error('Save failed:', error)
      alert('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  // 处理背景图上传
  const handleBackgroundUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setBackgroundImage(result)
    }
    reader.readAsDataURL(file)
  }

  const titleOptions = [
    { value: '首席成长伙伴', label: '首席成长伙伴' },
    { value: '金牌成长顾问', label: '金牌成长顾问' },
    { value: '五星服务官', label: '五星服务官' },
    { value: '学习领航官', label: '学习领航官' },
  ]

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">编辑名片</h1>
          <p className="text-brand-gray">完善您的个人信息，打造专业形象</p>
        </div>
        <div className="flex gap-3">
          {hasUnsavedChanges && (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? '保存中...' : '保存更改'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 编辑表单 */}
        <div className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>
                设置您的姓名、职位等基本信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">
                  姓名 *
                </label>
                <Input
                  value={cardData.name}
                  onChange={(e) => updateCardData({ name: e.target.value })}
                  placeholder="请输入您的姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">
                  职位头衔 *
                </label>
                <select
                  value={cardData.title}
                  onChange={(e) => updateCardData({ title: e.target.value })}
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus-brand"
                >
                  <option value="">请选择职位</option>
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
                  value={cardData.phone}
                  onChange={(e) => updateCardData({ phone: e.target.value })}
                  placeholder="请输入联系电话"
                />
              </div>
            </CardContent>
          </Card>

          {/* 头像上传 */}
          <AvatarUpload 
            currentAvatar={cardData.avatarUrl}
            onAvatarUpdate={(url) => updateCardData({ avatarUrl: url })}
          />

          {/* 业绩数据 */}
          <Card>
            <CardHeader>
              <CardTitle>业绩数据</CardTitle>
              <CardDescription>
                展示您的工作成果和专业水平
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">
                  已服务学员数
                </label>
                <Input
                  type="number"
                  value={cardData.studentsServed}
                  onChange={(e) => updateCardData({ studentsServed: parseInt(e.target.value) || 0 })}
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
                  value={cardData.rating}
                  onChange={(e) => updateCardData({ rating: parseFloat(e.target.value) || 0 })}
                  placeholder="请输入好评率"
                />
              </div>
            </CardContent>
          </Card>

          {/* 业务能力 */}
          <AbilitiesSelector
            abilities={{
              teacherScreening: cardData.teacherScreening,
              feedbackAbility: cardData.feedbackAbility,
              planningAbility: cardData.planningAbility,
              resourceSharing: cardData.resourceSharing,
            }}
            onAbilitiesChange={(abilities) => updateCardData(abilities)}
          />

          {/* 文字模块编辑器 */}
          <TextModulesEditor
            textModules={textModules}
            textStyles={textStyles}
            onTextModulesChange={updateTextModules}
            onTextStylesChange={updateTextStyles}
          />
        </div>

        {/* 实时预览 */}
        <div className="lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle>实时预览</CardTitle>
              <CardDescription>
                查看您的名片效果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessCardPreview
                user={{
                  ...user,
                  name: cardData.name,
                  title: cardData.title as any,
                  phone: cardData.phone,
                  students_served: cardData.studentsServed,
                  rating: cardData.rating,
                  avatar_url: cardData.avatarUrl,
                  teacher_screening: cardData.teacherScreening,
                  feedback_ability: cardData.feedbackAbility,
                  planning_ability: cardData.planningAbility,
                  resource_sharing: cardData.resourceSharing,
                }}
                textModules={textModules}
                textStyles={textStyles}
                abilities={{
                  teacherScreening: cardData.teacherScreening,
                  feedbackAbility: cardData.feedbackAbility,
                  planningAbility: cardData.planningAbility,
                  resourceSharing: cardData.resourceSharing,
                }}
                backgroundImage={backgroundImage}
                onBackgroundUpload={handleBackgroundUpload}
              />
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      // TODO: 实现分享功能
                    }}
                  >
                    分享名片
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      // TODO: 实现导出功能
                      window.location.href = '/dashboard/export'
                    }}
                  >
                    导出图片
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 保存提示 */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-brand-dark">有未保存的更改</p>
              <p className="text-xs text-brand-gray">记得保存您的修改</p>
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
