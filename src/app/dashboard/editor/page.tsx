'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth'
import { useCardStore } from '@/store/card'
import { TEXT_MODULES, MODULE_POSITIONS } from '@/config/positions'
import { supabase } from '@/lib/supabase/client'
import DraggableBusinessCardPreview from '@/components/card/draggable-business-card-preview'
import AvatarUpload from '@/components/editor/avatar-upload'
import AbilitiesSelector from '@/components/editor/abilities-selector'
import TextModulesEditor from '@/components/editor/text-modules-editor'
import HtmlToImageExport from '@/components/export/html-to-image-export'

export default function EditorPage() {
  const { user, updateUser } = useAuthStore()
  const { cardData, avatarConfig, logoConfig, updateCardData, updateAvatarConfig, updateLogoConfig, textModules, updateTextModules, textStyles, updateTextStyles, textPositions, updateTextPositions, setTextPositions, markAsSaved, hasUnsavedChanges, initializePositions } = useCardStore()
  const cardRef = useRef<HTMLDivElement>(null) // 添加ref用于导出
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState('/ditu.png')

  // 确保位置配置始终稳定
  useEffect(() => {
    initializePositions()
  }, [initializePositions])

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
      
      // 初始化文字模块数据 - 使用配置文件的默认值
      updateTextModules({
        name: user.name || TEXT_MODULES.name,
        title: user.title || TEXT_MODULES.title,
        phone: user.phone || TEXT_MODULES.phone,
        studentsServed: user.students_served || TEXT_MODULES.studentsServed,
        positiveRating: Math.round((user.rating || 0) * 20) || TEXT_MODULES.positiveRating, // 转换5分制为百分制，使用配置默认值
      })
    }
  }, [user, cardData.name, updateCardData, updateTextModules]) // 添加所有依赖项

  // 确保姓名默认值为配置文件中的默认值，并避免邮箱作为默认显示
  useEffect(() => {
    const looksLikeEmail = (v: string | undefined) => !!v && v.includes('@')
    if (!textModules.name || looksLikeEmail(textModules.name) || (user?.email && textModules.name === user.email)) {
      updateTextModules({ name: TEXT_MODULES.name })
    }
  }, [textModules.name, user?.email, updateTextModules])

  // 同步 cardData 到 textModules - 当基本信息编辑时
  useEffect(() => {
    if (cardData.name) { // 确保已经初始化
      updateTextModules({
        name: cardData.name,
        title: cardData.title,
        phone: cardData.phone,
        studentsServed: cardData.studentsServed,
        positiveRating: Math.round(cardData.rating * 20), // 转换5分制为百分制
      })
    }
  }, [cardData.name, cardData.title, cardData.phone, cardData.studentsServed, cardData.rating, updateTextModules])



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
      alert('فشل الحفظ، يرجى المحاولة لاحقاً')
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

  // 重置文字模块位置到初始位置 - 使用配置文件的默认位置
  const handleResetPositions = () => {
    setTextPositions(MODULE_POSITIONS.textPositions)
  }

  const titleOptions = [
    { value: 'شريك النمو الرئيسي', label: 'شريك النمو الرئيسي' },
    { value: 'مستشار النمو الذهبي', label: 'مستشار النمو الذهبي' },
    { value: 'مسؤول الخدمة الخماسي', label: 'مسؤول الخدمة الخماسي' },
    { value: 'مسؤول توجيه التعلم', label: 'مسؤول توجيه التعلم' },
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
          <h1 className="text-2xl font-bold text-brand-dark" dir="rtl">تعديل البطاقة</h1>
          <p className="text-brand-gray" dir="rtl">أكمل معلوماتك الشخصية، واصنع صورة مهنية</p>
        </div>
        {/* 顶部保存按钮已移除 */}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 编辑表单 */}
        <div className="space-y-6">

          {/* 头像上传 */}
          <AvatarUpload 
            currentAvatar={cardData.avatarUrl}
            onAvatarUpdate={(url) => updateCardData({ avatarUrl: url })}
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
              <CardTitle dir="rtl">معاينة مباشرة</CardTitle>
              <CardDescription dir="rtl">
                شاهد نتيجة بطاقتك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DraggableBusinessCardPreview
                cardRef={cardRef}
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
                avatarConfig={avatarConfig}
                textModules={textModules}
                textStyles={textStyles}
                textPositions={textPositions}
                abilities={{
                  teacherScreening: cardData.teacherScreening,
                  feedbackAbility: cardData.feedbackAbility,
                  planningAbility: cardData.planningAbility,
                  resourceSharing: cardData.resourceSharing,
                }}
                backgroundImage={backgroundImage}
                onBackgroundUpload={handleBackgroundUpload}
                onPositionChange={(moduleId, x, y) => {
                  updateTextPositions({
                    [moduleId]: { x, y }
                  })
                }}
                onAvatarPositionChange={(x, y) => {
                  updateAvatarConfig({
                    position: { x, y }
                  })
                }}
                logoConfig={logoConfig}
                onLogoPositionChange={(x, y) => {
                  updateLogoConfig({
                    position: { x, y }
                  })
                }}
              />
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex gap-2 mb-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      // TODO: 实现分享功能
                    }}
                  >
                    مشاركة البطاقة
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleResetPositions}
                    title="إعادة تعيين جميع مواضع النصوص إلى المواضع الأولية"
                  >
                    🔄 إعادة تعيين المواضع
                  </Button>
                </div>
                
                {/* HTML-to-Image导出功能 */}
                 <div className="space-y-4 mt-4">
                   <div className="text-center mb-4">
                     <h3 className="text-lg font-semibold text-gray-800 mb-2">📸 导出名片</h3>
                     <p className="text-sm text-gray-600">高质量HTML-to-Image导出</p>
                   </div>
                   
                   {/* HTML-to-Image导出 - 现代DOM */}
                   <HtmlToImageExport 
                     cardRef={cardRef}
                   />
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 底部保存提示已移除 */}
    </div>
  )
}
