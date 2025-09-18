'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { useCardStore } from '@/store/card'
import { supabase } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils'
import { removeBackgroundLocally, removeBackgroundAdvanced } from '@/lib/local-background-removal'

interface AvatarUploadProps {
  currentAvatar?: string
  onAvatarUpdate: (url: string) => void
}

export default function AvatarUpload({ currentAvatar, onAvatarUpdate }: AvatarUploadProps) {
  const { user, updateUser } = useAuthStore()
  const { avatarConfig, updateAvatarConfig } = useCardStore()
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processingMethod, setProcessingMethod] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة')
      return
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة لا يمكن أن يتجاوز 5 ميجابايت')
      return
    }

    try {
      setUploading(true)

      // 压缩图片
      const compressedBlob = await compressImage(file, 400, 400, 0.8)
      const compressedFile = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
      })

      // 上传到Supabase存储
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}/${Date.now()}.jpg`, compressedFile, {
          upsert: true,
        })

      if (error) throw error

      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path)

      // 检查是否需要AI抠图
      if (window.confirm('هل تريد استخدام الذكاء الاصطناعي لإزالة الخلفية تلقائياً؟ سيستخدم النظام واجهة برمجة التطبيقات المتخصصة أولاً، وإذا لم تكن متاحة فسيتم التبديل تلقائياً إلى الإزالة المحلية.')) {
        setProcessing(true)
        setProcessingMethod('جاري التهيئة...')
        try {
          await processWithAI(compressedFile, publicUrl)
        } catch (aiError) {
          console.error('AI processing failed:', aiError)
          // AI处理失败时使用原图
          await updateAvatar(publicUrl)
        } finally {
          setProcessing(false)
          setProcessingMethod('')
        }
      } else {
        await updateAvatar(publicUrl)
      }

    } catch (error) {
      console.error('Upload failed:', error)
      alert('فشل في الرفع، يرجى المحاولة مرة أخرى لاحقاً')
    } finally {
      setUploading(false)
    }
  }

  const processWithAI = async (file: File, fallbackUrl: string) => {
    try {
      // 首先尝试使用Remove.bg API
      const formData = new FormData()
      formData.append('image_file', file)

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        // Remove.bg API成功，使用处理后的图片
        setProcessingMethod('جاري استخدام واجهة برمجة التطبيقات المتخصصة لإزالة الخلفية...')
        const processedBlob = await response.blob()
        await uploadProcessedImage(processedBlob, 'remove_bg')
        return
      }

      // Remove.bg API失败，检查错误类型
      const errorData = await response.json().catch(() => ({}))
      
      if (response.status === 402 || errorData.error?.includes('配额') || errorData.error?.includes('余额')) {
        console.log('Remove.bg API配额不足，尝试本地抠图...')
        setProcessingMethod('حصة واجهة برمجة التطبيقات غير كافية، جاري استخدام الإزالة المحلية المتقدمة...')
        
        // 尝试本地抠图
        const localResult = await removeBackgroundAdvanced(file)
        
        if (localResult.success && localResult.imageData) {
          // 本地抠图成功
          setProcessingMethod('جاري المعالجة بالإزالة المحلية المتقدمة...')
          const response = await fetch(localResult.imageData)
          const blob = await response.blob()
          await uploadProcessedImage(blob, 'local_advanced')
          return
        } else {
          console.log('高级本地抠图失败，尝试简单本地抠图...')
          setProcessingMethod('فشلت الإزالة المتقدمة، جاري استخدام الإزالة المحلية البسيطة...')
          
          // 尝试简单本地抠图
          const simpleResult = await removeBackgroundLocally(file)
          
          if (simpleResult.success && simpleResult.imageData) {
            setProcessingMethod('جاري المعالجة بالإزالة المحلية البسيطة...')
            const response = await fetch(simpleResult.imageData)
            const blob = await response.blob()
            await uploadProcessedImage(blob, 'local_simple')
            return
          }
        }
      }

      // 所有抠图方法都失败，使用原图
      console.log('所有抠图方法都失败，使用原图')
      await updateAvatar(fallbackUrl)

    } catch (error) {
      console.error('AI processing failed:', error)
      // 使用原图作为备选
      await updateAvatar(fallbackUrl)
    }
  }

  const uploadProcessedImage = async (blob: Blob, method: string) => {
    if (!user) return

    const processedFile = new File([blob], `processed_${method}_${Date.now()}.png`, {
      type: 'image/png',
    })

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(`${user.id}/processed_${method}_${Date.now()}.png`, processedFile, {
        upsert: true,
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path)

    await updateAvatar(publicUrl)
  }

  const updateAvatar = async (url: string) => {
    if (!user) return

    try {
      // 更新数据库
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: url })
        .eq('id', user.id)

      if (error) throw error

      // 更新本地状态
      updateUser({ avatar_url: url })
      onAvatarUpdate(url)

      // 记录统计
      await supabase
        .from('usage_stats')
        .insert({
          user_id: user.id,
          action_type: 'upload_avatar',
          details: { avatar_url: url },
        })

    } catch (error) {
      console.error('Avatar update failed:', error)
      alert('فشل في تحديث الصورة الشخصية')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الصورة الشخصية</CardTitle>
        <CardDescription>
          ارفع صورتك الشخصية مع دعم الذكي الاصطناعي لإزالة الخلفية تلقائياً
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          {/* 当前头像预览 */}
          <div className="flex-shrink-0">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="الصورة الشخصية الحالية"
                className="w-20 h-20 rounded-full object-cover border-2 border-brand-primary/20"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center border-2 border-brand-primary/20">
                <span className="text-white font-bold text-2xl">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>

          {/* 上传按钮和说明 */}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || processing}
              variant="outline"
              className="mb-2"
            >
              {uploading ? 'جاري الرفع...' : processing ? 'جاري المعالجة بالذكاء الاصطناعي...' : 'اختر صورة'}
            </Button>
            
            {processing && processingMethod && (
              <div className="text-xs text-blue-600 mb-2">
                {processingMethod}
              </div>
            )}
            
            <p className="text-xs text-brand-gray">
              يدعم تنسيقات JPG و PNG، الحجم المقترح لا يتجاوز 5 ميجابايت
              <br />
              إزالة الخلفية الذكية: يستخدم واجهة برمجة التطبيقات المتخصصة أولاً، ثم يتراجع تلقائياً للمعالجة المحلية
            </p>
            
            {/* 头像大小调整 */}
            {currentAvatar && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="text-xs text-gray-600 mb-2 block">حجم الصورة الشخصية</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="80"
                    max="200"
                    value={avatarConfig.size}
                    onChange={(e) => updateAvatarConfig({ size: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-600 w-12 text-center">
                    {avatarConfig.size}px
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  اضبط حجم عرض الصورة الشخصية في البطاقة (80px-200px)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 处理进度提示 */}
        {(uploading || processing) && (
          <div className="mt-4 p-3 bg-brand-light/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="loading-spinner w-4 h-4"></div>
              <span className="text-sm text-brand-dark">
                {uploading ? 'جاري رفع الصورة...' : 'جاري معالجة إزالة الخلفية بالذكاء الاصطناعي...'}
              </span>
            </div>
            {processing && (
              <p className="text-xs text-brand-gray mt-1">
                قد تستغرق معالجة إزالة الخلفية بالذكاء الاصطناعي بضع ثوانٍ، يرجى الانتظار بصبر
              </p>
            )}
          </div>
        )}

        {/* 头像使用说明 */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">اقتراحات تحسين الصورة الشخصية</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• اختر صورة واضحة من الأمام، تجنب الصور الجانبية أو من الخلف</li>
            <li>• يُنصح باستخدام خلفية بلون واحد لتسهيل معالجة إزالة الخلفية بالذكاء الاصطناعي</li>
            <li>• حافظ على إضاءة جيدة، تجنب الظلام الشديد أو السطوع المفرط</li>
            <li>• تعبير طبيعي ومهني، يتناسب مع الصورة التجارية</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
