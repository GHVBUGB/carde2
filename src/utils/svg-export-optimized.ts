import { User } from '@/lib/types'

interface TextModules {
  companyName: string
  name: string
  title: string
  studentsServed: number
  positiveRating: number
  phone: string
  teacherSelectionLabel: string
  progressFeedbackLabel: string
  planningLabel: string
  resourceSharingLabel: string
}

interface TextStyles {
  companyName: { fontSize: number; color: string; fontWeight: string }
  name: { fontSize: number; color: string; fontWeight: string }
  title: { fontSize: number; color: string; fontWeight: string }
  studentsServed: { fontSize: number; color: string; fontWeight: string }
  positiveRating: { fontSize: number; color: string; fontWeight: string }
  phone: { fontSize: number; color: string; fontWeight: string }
  teacherSelectionLabel: { fontSize: number; color: string; fontWeight: string }
  progressFeedbackLabel: { fontSize: number; color: string; fontWeight: string }
  planningLabel: { fontSize: number; color: string; fontWeight: string }
  resourceSharingLabel: { fontSize: number; color: string; fontWeight: string }
}

interface TextPositions {
  companyName: { x: number; y: number }
  name: { x: number; y: number }
  title: { x: number; y: number }
  studentsServed: { x: number; y: number }
  positiveRating: { x: number; y: number }
  phone: { x: number; y: number }
  teacherSelectionLabel: { x: number; y: number }
  progressFeedbackLabel: { x: number; y: number }
  planningLabel: { x: number; y: number }
  resourceSharingLabel: { x: number; y: number }
}

interface AvatarConfig {
  size: number
  position: { x: number; y: number }
}

interface SvgExportOptions {
  user: User
  avatarConfig: AvatarConfig
  textModules: TextModules
  textStyles: TextStyles
  textPositions: TextPositions
  abilities: {
    teacherScreening: boolean
    feedbackAbility: boolean
    planningAbility: boolean
    resourceSharing: boolean
  }
  backgroundImage?: string
  scale?: number
}

export function generateOptimizedSVG(options: SvgExportOptions): string {
  const {
    user,
    avatarConfig,
    textModules,
    textStyles,
    textPositions,
    abilities,
    backgroundImage = '/底图.png',
    scale = 2
  } = options

  const width = 350 * scale
  const height = 500 * scale

  const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- 背景渐变 -->
    <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    
    <!-- 头像圆形裁剪 -->
    <clipPath id="avatarClip">
      <circle cx="${(avatarConfig.position.x + avatarConfig.size/2) * scale}" cy="${(avatarConfig.position.y + avatarConfig.size/2) * scale}" r="${(avatarConfig.size/2) * scale}"/>
    </clipPath>
    
    <!-- 阴影滤镜 -->
    <filter id="cardShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="25" stdDeviation="25" flood-color="rgba(0,0,0,0.25)"/>
    </filter>
    
    <!-- 文字阴影 -->
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="${width}" height="${height}" fill="url(#backgroundGradient)" rx="${16 * scale}" ry="${16 * scale}" filter="url(#cardShadow)"/>
  
  <!-- 背景纹理 -->
  <rect width="${width}" height="${height}" fill="url('${backgroundImage}')" rx="${16 * scale}" ry="${16 * scale}" opacity="0.3"/>
  
  <!-- 头像 -->
  ${user.avatar_url ? `
    <image href="${user.avatar_url}" 
           x="${avatarConfig.position.x * scale}" 
           y="${avatarConfig.position.y * scale}" 
           width="${avatarConfig.size * scale}" 
           height="${avatarConfig.size * scale}"
           clip-path="url(#avatarClip)"/>
    <circle cx="${(avatarConfig.position.x + avatarConfig.size/2) * scale}" 
            cy="${(avatarConfig.position.y + avatarConfig.size/2) * scale}" 
            r="${(avatarConfig.size/2) * scale}" 
            fill="none" 
            stroke="#ffffff" 
            stroke-width="${4 * scale}"/>
  ` : `
    <circle cx="${(avatarConfig.position.x + avatarConfig.size/2) * scale}" 
            cy="${(avatarConfig.position.y + avatarConfig.size/2) * scale}" 
            r="${(avatarConfig.size/2) * scale}" 
            fill="#e0e0e0" 
            stroke="#ffffff" 
            stroke-width="${4 * scale}"/>
  `}
  
  <!-- 姓名 -->
  <text x="${textPositions.name.x * scale}" 
        y="${textPositions.name.y * scale}" 
        font-family="Arial, sans-serif" 
        font-size="${textStyles.name.fontSize * scale}" 
        font-weight="${textStyles.name.fontWeight}" 
        fill="${textStyles.name.color}" 
        text-anchor="middle"
        filter="url(#textShadow)">
    ${textModules.name}
  </text>
  
  <!-- 职位 -->
  <text x="${textPositions.title.x * scale}" 
        y="${textPositions.title.y * scale}" 
        font-family="Arial, sans-serif" 
        font-size="${textStyles.title.fontSize * scale}" 
        font-weight="${textStyles.title.fontWeight}" 
        fill="${textStyles.title.color}" 
        text-anchor="middle"
        filter="url(#textShadow)">
    ${textModules.title}
  </text>
  
  <!-- 统计数据 -->
  <g transform="translate(${textPositions.studentsServed.x * scale}, ${textPositions.studentsServed.y * scale})">
    <text x="0" y="0" 
          font-family="Arial, sans-serif" 
          font-size="${textStyles.studentsServed.fontSize * scale}" 
          font-weight="${textStyles.studentsServed.fontWeight}" 
          fill="${textStyles.studentsServed.color}" 
          text-anchor="middle"
          filter="url(#textShadow)">
      ${textModules.studentsServed >= 1000 
        ? `${Math.floor(textModules.studentsServed / 1000)}K+`
        : textModules.studentsServed
      }
    </text>
    <text x="0" y="${textStyles.studentsServed.fontSize * scale * 0.6}" 
          font-family="Arial, sans-serif" 
          font-size="${textStyles.studentsServed.fontSize * 0.4 * scale}" 
          fill="${textStyles.studentsServed.color}" 
          text-anchor="middle"
          filter="url(#textShadow)">
      STUDENTS
    </text>
    <text x="0" y="${textStyles.studentsServed.fontSize * scale * 1.2}" 
          font-family="Arial, sans-serif" 
          font-size="${textStyles.studentsServed.fontSize * 0.4 * scale}" 
          fill="${textStyles.studentsServed.color}" 
          text-anchor="middle"
          filter="url(#textShadow)">
      SERVED
    </text>
  </g>
  
  <g transform="translate(${textPositions.positiveRating.x * scale}, ${textPositions.positiveRating.y * scale})">
    <text x="0" y="0" 
          font-family="Arial, sans-serif" 
          font-size="${textStyles.positiveRating.fontSize * scale}" 
          font-weight="${textStyles.positiveRating.fontWeight}" 
          fill="${textStyles.positiveRating.color}" 
          text-anchor="middle"
          filter="url(#textShadow)">
      ${textModules.positiveRating}%
    </text>
    <text x="0" y="${textStyles.positiveRating.fontSize * scale * 0.6}" 
          font-family="Arial, sans-serif" 
          font-size="${textStyles.positiveRating.fontSize * 0.4 * scale}" 
          fill="${textStyles.positiveRating.color}" 
          text-anchor="middle"
          filter="url(#textShadow)">
      POSITIVE
    </text>
    <text x="0" y="${textStyles.positiveRating.fontSize * scale * 1.2}" 
          font-family="Arial, sans-serif" 
          font-size="${textStyles.positiveRating.fontSize * 0.4 * scale}" 
          fill="${textStyles.positiveRating.color}" 
          text-anchor="middle"
          filter="url(#textShadow)">
      RATING
    </text>
  </g>
  
  <!-- 能力标签 -->
  ${abilities.teacherScreening ? `
    <text x="${textPositions.teacherSelectionLabel.x * scale}" 
          y="${textPositions.teacherSelectionLabel.y * scale}" 
          font-family="Arial, sans-serif" 
          font-size="${textStyles.teacherSelectionLabel.fontSize * scale}" 
          font-weight="${textStyles.teacherSelectionLabel.fontWeight}" 
          fill="${textStyles.teacherSelectionLabel.color}" 
          text-anchor="middle"
          filter="url(#textShadow)">
      ${textModules.teacherSelectionLabel.replace(/\n/g, ' ')}
    </text>
  ` : ''}
  
  ${abilities.feedbackAbility ? `
    <text x="${textPositions.progressFeedbackLabel.x * scale}" 
          y="${textPositions.progressFeedbackLabel.y * scale}" 
          font-family="Arial, sans-serif" 
          font-size="${textStyles.progressFeedbackLabel.fontSize * scale}" 
          font-weight="${textStyles.progressFeedbackLabel.fontWeight}" 
          fill="${textStyles.progressFeedbackLabel.color}" 
          text-anchor="middle"
          filter="url(#textShadow)">
      ${textModules.progressFeedbackLabel.replace(/\n/g, ' ')}
    </text>
  ` : ''}
  
  ${abilities.planningAbility ? `
    <text x="${textPositions.planningLabel.x * scale}" 
          y="${textPositions.planningLabel.y * scale}" 
          font-family="Arial, sans-serif" 
          font-size="${textStyles.planningLabel.fontSize * scale}" 
          font-weight="${textStyles.planningLabel.fontWeight}" 
          fill="${textStyles.planningLabel.color}" 
          text-anchor="middle"
          filter="url(#textShadow)">
      ${textModules.planningLabel.replace(/\n/g, ' ')}
    </text>
  ` : ''}
  
  ${abilities.resourceSharing ? `
    <text x="${textPositions.resourceSharingLabel.x * scale}" 
          y="${textPositions.resourceSharingLabel.y * scale}" 
          font-family="Arial, sans-serif" 
          font-size="${textStyles.resourceSharingLabel.fontSize * scale}" 
          font-weight="${textStyles.resourceSharingLabel.fontWeight}" 
          fill="${textStyles.resourceSharingLabel.color}" 
          text-anchor="middle"
          filter="url(#textShadow)">
      ${textModules.resourceSharingLabel.replace(/\n/g, ' ')}
    </text>
  ` : ''}
  
  <!-- 电话 -->
  <rect x="${(textPositions.phone.x - 60) * scale}" 
        y="${(textPositions.phone.y - 15) * scale}" 
        width="${120 * scale}" 
        height="${30 * scale}" 
        rx="${15 * scale}" 
        ry="${15 * scale}" 
        fill="rgba(255,255,255,0.2)"/>
  
  <text x="${textPositions.phone.x * scale}" 
        y="${textPositions.phone.y * scale}" 
        font-family="Arial, sans-serif" 
        font-size="${textStyles.phone.fontSize * scale}" 
        font-weight="${textStyles.phone.fontWeight}" 
        fill="${textStyles.phone.color}" 
        text-anchor="middle"
        filter="url(#textShadow)">
    电话: ${textModules.phone}
  </text>
</svg>
  `.trim()

  return svg
}

// SVG转高质量图片的函数
export function svgToHighQualityImage(svgString: string, width: number, height: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('无法创建Canvas上下文'))
      return
    }
    
    // 设置高分辨率
    const scale = 2
    canvas.width = width * scale
    canvas.height = height * scale
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    
    // 设置设备像素比
    const dpr = window.devicePixelRatio || 1
    ctx.scale(scale * dpr, scale * dpr)
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('无法生成图片'))
        }
      }, 'image/png', 1.0)
    }
    
    img.onerror = () => {
      reject(new Error('SVG图片加载失败'))
    }
    
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    img.src = url
  })
}





