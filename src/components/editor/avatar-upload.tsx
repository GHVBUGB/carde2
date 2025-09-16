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
      alert('请选择图片文件')
      return
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
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
      if (window.confirm('是否使用AI自动抠图处理头像？系统将优先使用专业API，如果不可用则自动切换到本地抠图。')) {
        setProcessing(true)
        setProcessingMethod('正在初始化...')
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
      alert('上传失败，请稍后重试')
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
        setProcessingMethod('使用专业API抠图中...')
        const processedBlob = await response.blob()
        await uploadProcessedImage(processedBlob, 'remove_bg')
        return
      }

      // Remove.bg API失败，检查错误类型
      const errorData = await response.json().catch(() => ({}))
      
      if (response.status === 402 || errorData.error?.includes('配额') || errorData.error?.includes('余额')) {
        console.log('Remove.bg API配额不足，尝试本地抠图...')
        setProcessingMethod('API配额不足，使用高级本地抠图...')
        
        // 尝试本地抠图
        const localResult = await removeBackgroundAdvanced(file)
        
        if (localResult.success && localResult.imageData) {
          // 本地抠图成功
          setProcessingMethod('高级本地抠图处理中...')
          const response = await fetch(localResult.imageData)
          const blob = await response.blob()
          await uploadProcessedImage(blob, 'local_advanced')
          return
        } else {
          console.log('高级本地抠图失败，尝试简单本地抠图...')
          setProcessingMethod('高级抠图失败，使用简单本地抠图...')
          
          // 尝试简单本地抠图
          const simpleResult = await removeBackgroundLocally(file)
          
          if (simpleResult.success && simpleResult.imageData) {
            setProcessingMethod('简单本地抠图处理中...')
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
      alert('头像更新失败')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>头像设置</CardTitle>
        <CardDescription>
          上传您的头像，支持AI自动抠图
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          {/* 当前头像预览 */}
          <div className="flex-shrink-0">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="当前头像"
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
              {uploading ? '上传中...' : processing ? 'AI处理中...' : '选择图片'}
            </Button>
            
            {processing && processingMethod && (
              <div className="text-xs text-blue-600 mb-2">
                {processingMethod}
              </div>
            )}
            
            <p className="text-xs text-brand-gray">
              支持 JPG、PNG 格式，建议大小不超过 5MB
              <br />
              智能抠图：优先使用专业API，自动回退到本地抠图
            </p>
            
            {/* 头像大小调整 */}
            {currentAvatar && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="text-xs text-gray-600 mb-2 block">头像大小</label>
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
                  调整头像在名片中的显示大小（80px-200px）
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
                {uploading ? '正在上传图片...' : '正在进行AI抠图处理...'}
              </span>
            </div>
            {processing && (
              <p className="text-xs text-brand-gray mt-1">
                AI抠图可能需要几秒钟时间，请耐心等待
              </p>
            )}
          </div>
        )}

        {/* 头像使用说明 */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">头像优化建议</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 选择清晰的正面照片，避免侧面或背面</li>
            <li>• 建议使用纯色背景，便于AI抠图处理</li>
            <li>• 保持良好的光线，避免过暗或过亮</li>
            <li>• 表情自然、专业，符合商务形象</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
