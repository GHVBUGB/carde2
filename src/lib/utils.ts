import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// 合并CSS类名的工具函数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 邮箱验证函数
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 检查是否为51Talk邮箱
export function is51TalkEmail(email: string): boolean {
  return email.endsWith('@51talk.com')
}

// 格式化日期
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成随机字符串
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 生成验证码
export function generateVerificationCode(): string {
  return Math.random().toString().slice(2, 8)
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 深拷贝函数
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  if (typeof obj === "object") {
    const clonedObj: any = {}
    for (const key in obj) {
      clonedObj[key] = deepClone(obj[key])
    }
    return clonedObj
  }
  return obj
}

// 错误处理函数
export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return '发生未知错误'
}

// 验证手机号
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 获取头衔的显示文本
export function getTitleDisplay(title: string): string {
  const titleMap: Record<string, string> = {
    '首席成长伙伴': '首席成长伙伴',
    '金牌成长顾问': '金牌成长顾问',
    '五星服务官': '五星服务官',
    '学习领航官': '学习领航官'
  }
  return titleMap[title] || title
}

// 格式化评分
export function formatRating(rating: number): string {
  return rating.toFixed(2)
}

// 格式化学员数量
export function formatStudentCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

// 颜色工具函数
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// 获取对比色
export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return '#000000'
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness > 128 ? '#000000' : '#ffffff'
}

// 本地存储工具
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 忽略存储错误
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch {
      // 忽略删除错误
    }
  }
}

// 图片工具函数
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// 压缩图片
export function compressImage(
  file: File, 
  maxWidth: number = 800, 
  maxHeight: number = 800, 
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 计算新尺寸
      let { width, height } = img
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // 绘制图片
      ctx?.drawImage(img, 0, 0, width, height)
      
      // 导出为Blob
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
