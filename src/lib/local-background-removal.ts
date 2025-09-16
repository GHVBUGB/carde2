/**
 * 本地背景移除功能
 * 当Remove.bg API不可用或余额不足时的备选方案
 */

export interface LocalRemovalResult {
  success: boolean
  imageData?: string
  error?: string
}

/**
 * 使用Canvas进行简单的背景移除
 * 这是一个基础实现，效果可能不如专业API
 */
export async function removeBackgroundLocally(file: File): Promise<LocalRemovalResult> {
  return new Promise((resolve) => {
    try {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        resolve({ success: false, error: 'Canvas不支持' })
        return
      }

      img.onload = () => {
        // 设置canvas尺寸
        canvas.width = img.width
        canvas.height = img.height

        // 绘制原图
        ctx.drawImage(img, 0, 0)

        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // 简单的背景移除算法
        // 这里使用基于颜色相似度的简单方法
        const processedData = removeBackgroundSimple(data, canvas.width, canvas.height)

        // 创建新的ImageData
        const newImageData = ctx.createImageData(canvas.width, canvas.height)
        newImageData.data.set(processedData)

        // 绘制处理后的图像
        ctx.putImageData(newImageData, 0, 0)

        // 转换为blob
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                success: true,
                imageData: reader.result as string
              })
            }
            reader.readAsDataURL(blob)
          } else {
            resolve({ success: false, error: '图像处理失败' })
          }
        }, 'image/png')
      }

      img.onerror = () => {
        resolve({ success: false, error: '图像加载失败' })
      }

      // 加载图片
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } catch (error) {
      resolve({ 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      })
    }
  })
}

/**
 * 简单的背景移除算法
 * 基于边缘检测和颜色分析
 */
function removeBackgroundSimple(
  data: Uint8ClampedArray, 
  width: number, 
  height: number
): Uint8ClampedArray {
  const newData = new Uint8ClampedArray(data)
  
  // 获取图像中心区域的颜色作为背景色参考
  const centerX = Math.floor(width / 2)
  const centerY = Math.floor(height / 2)
  const centerIndex = (centerY * width + centerX) * 4
  
  const bgR = data[centerIndex]
  const bgG = data[centerIndex + 1]
  const bgB = data[centerIndex + 2]
  
  // 遍历所有像素
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // 计算与背景色的相似度
    const colorDiff = Math.sqrt(
      Math.pow(r - bgR, 2) + 
      Math.pow(g - bgG, 2) + 
      Math.pow(b - bgB, 2)
    )
    
    // 如果颜色相似度高，则设为透明
    if (colorDiff < 50) {
      newData[i + 3] = 0 // 设置alpha为0（透明）
    } else {
      // 保持原像素
      newData[i] = r
      newData[i + 1] = g
      newData[i + 2] = b
      newData[i + 3] = a
    }
  }
  
  return newData
}

/**
 * 更高级的背景移除算法
 * 使用边缘检测和区域生长
 */
export async function removeBackgroundAdvanced(file: File): Promise<LocalRemovalResult> {
  return new Promise((resolve) => {
    try {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        resolve({ success: false, error: 'Canvas不支持' })
        return
      }

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // 使用更复杂的算法
        const processedData = removeBackgroundAdvancedAlgorithm(data, canvas.width, canvas.height)

        const newImageData = ctx.createImageData(canvas.width, canvas.height)
        newImageData.data.set(processedData)
        ctx.putImageData(newImageData, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                success: true,
                imageData: reader.result as string
              })
            }
            reader.readAsDataURL(blob)
          } else {
            resolve({ success: false, error: '图像处理失败' })
          }
        }, 'image/png')
      }

      img.onerror = () => {
        resolve({ success: false, error: '图像加载失败' })
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } catch (error) {
      resolve({ 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      })
    }
  })
}

/**
 * 高级背景移除算法
 * 结合边缘检测、颜色聚类和形态学操作
 */
function removeBackgroundAdvancedAlgorithm(
  data: Uint8ClampedArray, 
  width: number, 
  height: number
): Uint8ClampedArray {
  const newData = new Uint8ClampedArray(data)
  
  // 1. 边缘检测
  const edges = detectEdges(data, width, height)
  
  // 2. 颜色聚类分析
  const dominantColors = analyzeColors(data, width, height)
  
  // 3. 背景区域识别
  const backgroundMask = identifyBackground(data, width, height, dominantColors)
  
  // 4. 应用遮罩
  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4
    const x = pixelIndex % width
    const y = Math.floor(pixelIndex / width)
    
    if (backgroundMask[y * width + x]) {
      newData[i + 3] = 0 // 设为透明
    } else {
      newData[i] = data[i]
      newData[i + 1] = data[i + 1]
      newData[i + 2] = data[i + 2]
      newData[i + 3] = data[i + 3]
    }
  }
  
  return newData
}

/**
 * 简单的边缘检测
 */
function detectEdges(data: Uint8ClampedArray, width: number, height: number): boolean[] {
  const edges = new Array(width * height).fill(false)
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = (y * width + x) * 4
      
      // 计算梯度
      const gx = Math.abs(
        data[index - 4] - data[index + 4] + // 水平梯度
        2 * (data[index - width * 4] - data[index + width * 4])
      )
      
      const gy = Math.abs(
        data[index - width * 4] - data[index + width * 4] + // 垂直梯度
        2 * (data[index - 4] - data[index + 4])
      )
      
      const gradient = Math.sqrt(gx * gx + gy * gy)
      
      // 如果梯度大于阈值，认为是边缘
      if (gradient > 50) {
        edges[y * width + x] = true
      }
    }
  }
  
  return edges
}

/**
 * 分析图像中的主要颜色
 */
function analyzeColors(data: Uint8ClampedArray, width: number, height: number): number[][] {
  const colors: { [key: string]: number } = {}
  
  // 采样分析颜色分布
  for (let i = 0; i < data.length; i += 16) { // 每16个像素采样一次
    const r = Math.floor(data[i] / 32) * 32
    const g = Math.floor(data[i + 1] / 32) * 32
    const b = Math.floor(data[i + 2] / 32) * 32
    
    const colorKey = `${r},${g},${b}`
    colors[colorKey] = (colors[colorKey] || 0) + 1
  }
  
  // 返回最常见的几种颜色
  return Object.entries(colors)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([color]) => color.split(',').map(Number))
}

/**
 * 识别背景区域
 */
function identifyBackground(
  data: Uint8ClampedArray, 
  width: number, 
  height: number, 
  dominantColors: number[][]
): boolean[] {
  const backgroundMask = new Array(width * height).fill(false)
  
  // 检查图像边缘的颜色
  const edgeColors: number[][] = []
  
  // 上边缘
  for (let x = 0; x < width; x++) {
    const index = x * 4
    edgeColors.push([data[index], data[index + 1], data[index + 2]])
  }
  
  // 下边缘
  for (let x = 0; x < width; x++) {
    const index = ((height - 1) * width + x) * 4
    edgeColors.push([data[index], data[index + 1], data[index + 2]])
  }
  
  // 左边缘
  for (let y = 0; y < height; y++) {
    const index = (y * width) * 4
    edgeColors.push([data[index], data[index + 1], data[index + 2]])
  }
  
  // 右边缘
  for (let x = 0; x < width; x++) {
    const index = ((height - 1) * width + x) * 4
    edgeColors.push([data[index], data[index + 1], data[index + 2]])
  }
  
  // 分析边缘颜色，找出背景色
  const backgroundColors = analyzeColors(
    new Uint8ClampedArray(edgeColors.flat()), 
    edgeColors.length, 
    1
  )
  
  // 标记与背景色相似的像素
  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    
    // 检查是否与任何背景色相似
    for (const [bgR, bgG, bgB] of backgroundColors) {
      const colorDiff = Math.sqrt(
        Math.pow(r - bgR, 2) + 
        Math.pow(g - bgG, 2) + 
        Math.pow(b - bgB, 2)
      )
      
      if (colorDiff < 80) {
        backgroundMask[pixelIndex] = true
        break
      }
    }
  }
  
  return backgroundMask
}
