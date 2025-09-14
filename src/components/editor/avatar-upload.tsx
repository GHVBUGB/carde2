'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils'

interface AvatarUploadProps {
  currentAvatar?: string
  onAvatarUpdate: (url: string) => void
}

export default function AvatarUpload({ currentAvatar, onAvatarUpdate }: AvatarUploadProps) {
  const { user, updateUser } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
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
      if (window.confirm('是否使用AI自动抠图处理头像？这将提供更好的展示效果。')) {
        setProcessing(true)
        try {
          await processWithAI(compressedFile, publicUrl)
        } catch (aiError) {
          console.error('AI processing failed:', aiError)
          // AI处理失败时使用原图
          await updateAvatar(publicUrl)
        } finally {
          setProcessing(false)
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
      // 调用Remove.bg API
      const formData = new FormData()
      formData.append('image_file', file)

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('AI处理失败')
      }

      const processedBlob = await response.blob()
      
      // 上传处理后的图片
      const processedFile = new File([processedBlob], `processed_${Date.now()}.png`, {
        type: 'image/png',
      })

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${user!.id}/processed_${Date.now()}.png`, processedFile, {
          upsert: true,
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path)

      await updateAvatar(publicUrl)

    } catch (error) {
      console.error('AI processing failed:', error)
      // 使用原图作为备选
      await updateAvatar(fallbackUrl)
    }
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
            
            <p className="text-xs text-brand-gray">
              支持 JPG、PNG 格式，建议大小不超过 5MB
              <br />
              系统将自动优化图片并提供AI抠图选项
            </p>
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
