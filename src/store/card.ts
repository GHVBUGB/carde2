import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LayoutModule } from '@/lib/types'

interface CardState {
  // 布局配置
  layouts: LayoutModule[]
  isDragMode: boolean
  selectedModule: string | null
  
  // 名片数据
  cardData: {
    name: string
    title: string
    email: string
    phone: string
    studentsServed: number
    rating: number
    avatarUrl: string
    // 业务能力
    teacherScreening: boolean
    feedbackAbility: boolean
    planningAbility: boolean
    resourceSharing: boolean
  }
  
  // 头像配置
  avatarConfig: {
    size: number
    position: { x: number; y: number }
  }
  
  // 文字模块数据
  textModules: {
    companyName: string
    name: string
    title: string
    studentsServed: number
    positiveRating: number
    phone: string
    // 业务能力标签文字
    teacherSelectionLabel: string
    progressFeedbackLabel: string
    planningLabel: string
    resourceSharingLabel: string
  }
  
  // 文字样式配置
  textStyles: {
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
  
  // 文字模块位置配置
  textPositions: {
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
  
  // UI状态
  isPreviewMode: boolean
  isEditing: boolean
  hasUnsavedChanges: boolean
}

interface CardActions {
  // 布局操作
  setLayouts: (layouts: LayoutModule[]) => void
  updateLayout: (id: string, updates: Partial<LayoutModule>) => void
  setDragMode: (isDragMode: boolean) => void
  setSelectedModule: (moduleId: string | null) => void
  
  // 名片数据操作
  updateCardData: (updates: Partial<CardState['cardData']>) => void
  setCardData: (data: CardState['cardData']) => void
  
  // 文字模块操作
  updateTextModules: (updates: Partial<CardState['textModules']>) => void
  setTextModules: (data: CardState['textModules']) => void
  
  // 文字样式操作
  updateTextStyles: (updates: Partial<CardState['textStyles']>) => void
  setTextStyles: (data: CardState['textStyles']) => void
  
  // 文字位置操作
  updateTextPositions: (updates: Partial<CardState['textPositions']>) => void
  setTextPositions: (data: CardState['textPositions']) => void
  
  // 头像配置操作
  updateAvatarConfig: (updates: Partial<CardState['avatarConfig']>) => void
  setAvatarConfig: (data: CardState['avatarConfig']) => void
  
  // UI状态操作
  setPreviewMode: (isPreview: boolean) => void
  setIsEditing: (isEditing: boolean) => void
  markAsChanged: () => void
  markAsSaved: () => void
  
  // 重置
  reset: () => void
}

const initialCardData = {
  name: '',
  title: '',
  email: '',
  phone: '',
  studentsServed: 0,
  rating: 0,
  avatarUrl: '',
  teacherScreening: false,
  feedbackAbility: false,
  planningAbility: false,
  resourceSharing: false,
}

const initialTextModules = {
  companyName: '51Talk',
  name: 'أحمد',
  title: 'SENIOR LANGUAGE COACH',
  studentsServed: 5000,
  positiveRating: 99,
  phone: '050-XXXX-XXAB',
  teacherSelectionLabel: 'اختيار\nالمعلم',
  progressFeedbackLabel: 'تعليقات\nالتقدم',
  planningLabel: 'خطة\nالدراسة',
  resourceSharingLabel: 'موارد\nالتعلم'
}

const initialTextStyles = {
  companyName: { fontSize: 14, color: '#ffffff', fontWeight: 'bold' },
  name: { fontSize: 20, color: '#000000', fontWeight: 'bold' },
  title: { fontSize: 14, color: '#666666', fontWeight: 'normal' },
  studentsServed: { fontSize: 12, color: '#ffffff', fontWeight: 'bold' },
  positiveRating: { fontSize: 12, color: '#ffffff', fontWeight: 'bold' },
  phone: { fontSize: 14, color: '#000000', fontWeight: 'bold' },
  teacherSelectionLabel: { fontSize: 8, color: '#000000', fontWeight: 'normal' },
  progressFeedbackLabel: { fontSize: 8, color: '#000000', fontWeight: 'normal' },
  planningLabel: { fontSize: 8, color: '#000000', fontWeight: 'normal' },
  resourceSharingLabel: { fontSize: 8, color: '#000000', fontWeight: 'normal' }
}

const initialTextPositions = {
  companyName: { x: 16, y: 16 },
  name: { x: 150, y: 241 },
  title: { x: 267, y:126 },
  studentsServed: { x: 121, y: 322 },
  positiveRating: { x: 192, y: 322 },
  phone: { x: 182, y: 431 },
  teacherSelectionLabel: { x: 95, y: 402 },
  progressFeedbackLabel: { x: 142, y: 402 },
  planningLabel: { x: 190, y: 402 },
  resourceSharingLabel: { x: 241, y: 402 }
}

const initialAvatarConfig = {
  size: 200, // 默认200px，更大的头像
  position: { x: 73, y: 27 } // 默认位置：名片顶部居中，调整位置适应更大头像
}

export const useCardStore = create<CardState & CardActions>()(
  persist(
    (set, get) => ({
      // 初始状态
      layouts: [],
      isDragMode: false,
      selectedModule: null,
      cardData: initialCardData,
      avatarConfig: initialAvatarConfig,
      textModules: initialTextModules,
      textStyles: initialTextStyles,
      textPositions: initialTextPositions,
      isPreviewMode: false,
      isEditing: false,
      hasUnsavedChanges: false,

      // 布局操作
      setLayouts: (layouts) => set({ layouts }),

      updateLayout: (id, updates) => {
        const layouts = get().layouts.map(layout => 
          layout.id === id ? { ...layout, ...updates } : layout
        )
        set({ layouts, hasUnsavedChanges: true })
      },

      setDragMode: (isDragMode) => set({ isDragMode }),

      setSelectedModule: (moduleId) => set({ selectedModule: moduleId }),

      // 名片数据操作
      updateCardData: (updates) => {
        const cardData = { ...get().cardData, ...updates }
        set({ cardData, hasUnsavedChanges: true })
      },

      setCardData: (data) => set({ cardData: data }),

      // 文字模块操作
      updateTextModules: (updates) => {
        const textModules = { ...get().textModules, ...updates }
        set({ textModules, hasUnsavedChanges: true })
      },

      setTextModules: (data) => set({ textModules: data }),

      // 文字样式操作
      updateTextStyles: (updates) => {
        const textStyles = { ...get().textStyles, ...updates }
        set({ textStyles, hasUnsavedChanges: true })
      },

      setTextStyles: (data) => set({ textStyles: data }),

      // 文字位置操作
      updateTextPositions: (updates) => {
        const textPositions = { ...get().textPositions, ...updates }
        set({ textPositions, hasUnsavedChanges: true })
      },

      setTextPositions: (data) => set({ textPositions: data }),

      // UI状态操作
      setPreviewMode: (isPreviewMode) => set({ isPreviewMode }),

      setIsEditing: (isEditing) => set({ isEditing }),

      markAsChanged: () => set({ hasUnsavedChanges: true }),

      markAsSaved: () => set({ hasUnsavedChanges: false }),

      // 头像配置操作
      updateAvatarConfig: (updates) => {
        set(state => ({
          avatarConfig: { ...state.avatarConfig, ...updates },
          hasUnsavedChanges: true
        }))
      },

      setAvatarConfig: (data) => set({ avatarConfig: data, hasUnsavedChanges: true }),

      // 重置
      reset: () => set({
        layouts: [],
        isDragMode: false,
        selectedModule: null,
        cardData: initialCardData,
        avatarConfig: initialAvatarConfig,
        textModules: initialTextModules,
        textStyles: initialTextStyles,
        textPositions: initialTextPositions,
        isPreviewMode: false,
        isEditing: false,
        hasUnsavedChanges: false,
      }),
    }),
    {
      name: 'card-storage',
      partialize: (state) => ({
        // 只持久化重要的配置数据，不持久化UI状态
        avatarConfig: state.avatarConfig,
        textModules: state.textModules,
        textStyles: state.textStyles,
        textPositions: state.textPositions,
        cardData: state.cardData,
      }),
    }
  )
)
