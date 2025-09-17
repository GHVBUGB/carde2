/**
 * 防变形导出工具
 * 专门解决 dom-to-image 和 html2canvas 的变形问题
 */

import html2canvas from 'html2canvas'

export interface AntiDeformationConfig {
  targetWidth: number
  targetHeight: number
  scale: number
  format: 'png' | 'jpeg'
  quality: number
  backgroundColor?: string
}

export interface ExportResult {
  success: boolean
  canvas?: HTMLCanvasElement
  blob?: Blob
  error?: string
  dimensions: {
    original: { width: number; height: number }
    target: { width: number; height: number }
    final: { width: number; height: number }
  }
}

/**
 * 🎯 核心防变形导出函数
 * 使用多种技术确保图片不变形
 */
export async function antiDeformationExport(
  element: HTMLElement,
  config: AntiDeformationConfig
): Promise<ExportResult> {
  
  try {
    // 1. 获取元素真实尺寸
    const originalDimensions = getElementRealDimensions(element)
    console.log('原始元素尺寸:', originalDimensions)

    // 2. 目标尺寸采用“实际显示尺寸”，仅用 scale 提升清晰度，避免大画布小内容
    const targetDimensions = { width: originalDimensions.width, height: originalDimensions.height }
    console.log('目标尺寸:', targetDimensions)

    // 3. 创建标准化容器
    const { container, cleanup } = await createStandardizedContainer(element, targetDimensions)

    try {
      // 4. 使用防变形截图
      const canvas = await captureWithoutDeformation(container, config, targetDimensions)

      // 5. 验证和修正画布
      const finalCanvas = await validateAndCorrectCanvas(canvas, config, targetDimensions)

      // 6. 生成最终文件
      const blob = await canvasToOptimizedBlob(finalCanvas, config)

      return {
        success: true,
        canvas: finalCanvas,
        blob,
        dimensions: {
          original: originalDimensions,
          target: targetDimensions,
          final: { width: finalCanvas.width, height: finalCanvas.height }
        }
      }

    } finally {
      cleanup()
    }

  } catch (error: any) {
    console.error('防变形导出失败:', error)
    return {
      success: false,
      error: error.message,
      dimensions: {
        original: { width: 0, height: 0 },
        target: { width: 0, height: 0 },
        final: { width: 0, height: 0 }
      }
    }
  }
}

/**
 * 🔍 获取元素的真实渲染尺寸
 */
function getElementRealDimensions(element: HTMLElement): { width: number; height: number } {
  const rect = element.getBoundingClientRect()
  const computedStyle = window.getComputedStyle(element)
  
  // 获取多种尺寸测量方式
  const measurements = {
    boundingRect: { width: rect.width, height: rect.height },
    offsetSize: { width: element.offsetWidth, height: element.offsetHeight },
    clientSize: { width: element.clientWidth, height: element.clientHeight },
    computedSize: {
      width: parseFloat(computedStyle.width) || 0,
      height: parseFloat(computedStyle.height) || 0
    }
  }

  console.log('尺寸测量结果:', measurements)

  // 选择最可靠的尺寸（优先使用 boundingRect，因为它反映实际渲染尺寸）
  return {
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  }
}

/**
 * 📐 计算目标尺寸，保持宽高比
 */
function calculateTargetDimensions(
  original: { width: number; height: number },
  config: AntiDeformationConfig
): { width: number; height: number } {
  
  const aspectRatio = original.width / original.height
  const targetAspectRatio = config.targetWidth / config.targetHeight

  let targetWidth = config.targetWidth
  let targetHeight = config.targetHeight

  // 如果宽高比不匹配，调整尺寸以保持原始比例
  if (Math.abs(aspectRatio - targetAspectRatio) > 0.01) {
    if (aspectRatio > targetAspectRatio) {
      // 原始更宽，以宽度为准
      targetHeight = Math.round(config.targetWidth / aspectRatio)
    } else {
      // 原始更高，以高度为准
      targetWidth = Math.round(config.targetHeight * aspectRatio)
    }
  }

  return { width: targetWidth, height: targetHeight }
}

/**
 * 🏗️ 创建标准化的临时容器
 */
async function createStandardizedContainer(
  element: HTMLElement,
  dimensions: { width: number; height: number }
): Promise<{ container: HTMLElement; cleanup: () => void }> {
  
  // 创建临时容器
  const container = document.createElement('div')
  container.style.cssText = `
    position: absolute;
    top: -9999px;
    left: -9999px;
    width: ${dimensions.width}px;
    height: ${dimensions.height}px;
    overflow: hidden;
    background: white;
    z-index: -1;
    box-sizing: border-box;
  `

  // 深度克隆元素
  const clonedElement = element.cloneNode(true) as HTMLElement
  
  // 标准化克隆元素
  standardizeClonedElement(clonedElement, dimensions)
  
  container.appendChild(clonedElement)
  document.body.appendChild(container)

  // 等待渲染完成
  await new Promise(resolve => setTimeout(resolve, 100))

  return {
    container,
    cleanup: () => {
      if (document.body.contains(container)) {
        document.body.removeChild(container)
      }
    }
  }
}

/**
 * 🎨 标准化克隆元素的样式
 */
function standardizeClonedElement(
  element: HTMLElement,
  dimensions: { width: number; height: number }
): void {
  
  // 重置所有可能影响尺寸的样式
  element.style.cssText = `
    width: ${dimensions.width}px !important;
    height: ${dimensions.height}px !important;
    max-width: none !important;
    max-height: none !important;
    min-width: ${dimensions.width}px !important;
    min-height: ${dimensions.height}px !important;
    position: relative !important;
    transform: none !important;
    zoom: 1 !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    overflow: hidden !important;
  `

  // 递归处理所有子元素
  const allElements = element.querySelectorAll('*')
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement
    
    // 重置变换和缩放
    htmlEl.style.transform = 'none'
    htmlEl.style.zoom = '1'
    htmlEl.style.scale = '1'
    
    // 特殊处理图片元素
    if (htmlEl.tagName === 'IMG') {
      htmlEl.style.objectFit = 'cover'
      htmlEl.style.objectPosition = 'center'
      htmlEl.style.width = '100%'
      htmlEl.style.height = '100%'
      htmlEl.style.maxWidth = 'none'
      htmlEl.style.maxHeight = 'none'
    }
    
    // 特殊处理背景图片
    if (htmlEl.style.backgroundImage) {
      htmlEl.style.backgroundSize = 'cover'
      htmlEl.style.backgroundPosition = 'center'
      htmlEl.style.backgroundRepeat = 'no-repeat'
    }
  })
}

/**
 * 📸 使用防变形设置进行截图
 */
async function captureWithoutDeformation(
  container: HTMLElement,
  config: AntiDeformationConfig,
  dimensions: { width: number; height: number }
): Promise<HTMLCanvasElement> {
  
  return html2canvas(container, {
    // 基础设置
    scale: config.scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: config.backgroundColor || '#ffffff',
    logging: false,
    
    // 关键防变形设置
    width: dimensions.width,
    height: dimensions.height,
    windowWidth: dimensions.width,
    windowHeight: dimensions.height,
    scrollX: 0,
    scrollY: 0,
    
    // 渲染优化
    imageTimeout: 30000,
    removeContainer: false,
    
    // 克隆回调 - 进一步确保尺寸正确
    onclone: (clonedDoc, clonedElement) => {
      // 强制设置克隆元素尺寸
      clonedElement.style.width = dimensions.width + 'px'
      clonedElement.style.height = dimensions.height + 'px'
      clonedElement.style.transform = 'none'
      clonedElement.style.zoom = '1'
      clonedElement.style.scale = '1'
      
      // 确保所有子元素也正确设置
      const allElements = clonedElement.querySelectorAll('*')
      allElements.forEach(el => {
        const htmlEl = el as HTMLElement
        htmlEl.style.transform = 'none'
        htmlEl.style.zoom = '1'
        htmlEl.style.scale = '1'
      })
    }
  })
}

/**
 * ✅ 验证和修正画布尺寸
 */
async function validateAndCorrectCanvas(
  canvas: HTMLCanvasElement,
  config: AntiDeformationConfig,
  dimensions: { width: number; height: number }
): Promise<HTMLCanvasElement> {
  
  const expectedWidth = dimensions.width * config.scale
  const expectedHeight = dimensions.height * config.scale
  
  console.log('画布尺寸验证:', {
    actual: { width: canvas.width, height: canvas.height },
    expected: { width: expectedWidth, height: expectedHeight }
  })
  
  // 如果尺寸正确，直接返回
  if (canvas.width === expectedWidth && canvas.height === expectedHeight) {
    return canvas
  }
  
  // 创建修正的画布
  const correctedCanvas = document.createElement('canvas')
  const ctx = correctedCanvas.getContext('2d')!
  
  correctedCanvas.width = expectedWidth
  correctedCanvas.height = expectedHeight
  
  // 高质量缩放
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  // 绘制到修正的画布上
  ctx.drawImage(canvas, 0, 0, expectedWidth, expectedHeight)
  
  console.log('画布已修正:', {
    width: correctedCanvas.width,
    height: correctedCanvas.height
  })
  
  return correctedCanvas
}

/**
 * 💾 将画布转换为优化的Blob
 */
async function canvasToOptimizedBlob(
  canvas: HTMLCanvasElement,
  config: AntiDeformationConfig
): Promise<Blob> {
  
  return new Promise((resolve, reject) => {
    const mimeType = config.format === 'png' ? 'image/png' : 'image/jpeg'
    
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('无法生成图片文件'))
      }
    }, mimeType, config.quality)
  })
}

/**
 * 🚀 快速导出函数 - 使用默认配置
 */
export async function quickAntiDeformationExport(
  element: HTMLElement,
  quality: 'standard' | 'high' | 'ultra' = 'high',
  format: 'png' | 'jpeg' = 'png'
): Promise<ExportResult> {
  
  const configs = {
    standard: { scale: 2, width: 700, height: 1000 },
    high: { scale: 3, width: 1050, height: 1500 },
    ultra: { scale: 4, width: 1400, height: 2000 }
  }
  
  const config = configs[quality]
  
  return antiDeformationExport(element, {
    targetWidth: config.width,
    targetHeight: config.height,
    scale: config.scale,
    format,
    quality: format === 'png' ? 1.0 : 0.95,
    backgroundColor: format === 'png' ? undefined : '#ffffff'
  })
}
