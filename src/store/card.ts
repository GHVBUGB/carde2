import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LayoutModule } from '@/lib/types'
import { MODULE_POSITIONS, TEXT_STYLES, TEXT_MODULES } from '../config/positions'

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
  
  // Logo配置
  logoConfig: {
    enabled: boolean
    src: string
    size: { width: number; height: number }
    position: { x: number; y: number }
  }
  
  // 文字模块数据
  textModules: {
    companyName: string
    name: string
    title: string
    studentsServed: number
    studentsServedLabel: string
    positiveRating: number
    positiveRatingLabel: string
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
    studentsServedLabel: { fontSize: number; color: string; fontWeight: string }
    positiveRating: { fontSize: number; color: string; fontWeight: string }
    positiveRatingLabel: { fontSize: number; color: string; fontWeight: string }
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
    studentsServedLabel: { x: number; y: number }
    positiveRating: { x: number; y: number }
    positiveRatingLabel: { x: number; y: number }
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
  
  // Logo配置操作
  updateLogoConfig: (updates: Partial<CardState['logoConfig']>) => void
  setLogoConfig: (data: CardState['logoConfig']) => void
  
  // UI状态操作
  setPreviewMode: (isPreview: boolean) => void
  setIsEditing: (isEditing: boolean) => void
  markAsChanged: () => void
  markAsSaved: () => void
  
  // 重置
  reset: () => void
  
  // 初始化位置配置
  initializePositions: () => void
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

const initialTextModules = TEXT_MODULES

const initialTextStyles = TEXT_STYLES

const initialTextPositions = MODULE_POSITIONS.textPositions

const initialAvatarConfig = MODULE_POSITIONS.avatarConfig

const initialLogoConfig = MODULE_POSITIONS.logoConfig

export const useCardStore = create<CardState & CardActions>()(
  persist(
    (set, get) => ({
      // 初始状态 - 始终使用代码中的默认配置
      layouts: [],
      isDragMode: false,
      selectedModule: null,
      cardData: initialCardData,
      avatarConfig: initialAvatarConfig,
      logoConfig: initialLogoConfig,
      textModules: initialTextModules,
      textStyles: initialTextStyles,
      textPositions: initialTextPositions, // 始终使用默认位置
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

      // Logo配置操作
      updateLogoConfig: (updates) => {
        set(state => ({
          logoConfig: { ...state.logoConfig, ...updates },
          hasUnsavedChanges: true
        }))
      },

      setLogoConfig: (data) => set({ logoConfig: data, hasUnsavedChanges: true }),

      // 重置
      reset: () => set({
        layouts: [],
        isDragMode: false,
        selectedModule: null,
        cardData: initialCardData,
        avatarConfig: initialAvatarConfig,
        logoConfig: initialLogoConfig,
        textModules: initialTextModules,
        textStyles: initialTextStyles,
        textPositions: initialTextPositions,
        isPreviewMode: false,
        isEditing: false,
        hasUnsavedChanges: false,
      }),

      // 强制使用配置文件中的默认位置
      initializePositions: () => {
        // 强制使用配置文件中的默认值，确保位置正确
        set({
          textPositions: initialTextPositions,
          avatarConfig: initialAvatarConfig,
          logoConfig: initialLogoConfig,
        })
      },
    }),
    {
      name: 'card-storage-final', // 使用全新的存储名称，彻底清除旧数据
      partialize: (state) => ({
        // 持久化用户自定义的配置，但不包括位置配置
        textModules: state.textModules,
        textStyles: state.textStyles,
        cardData: state.cardData,
        // 不持久化位置相关配置，确保每次都使用配置文件的默认值
        // logoConfig: state.logoConfig, 
        // textPositions: state.textPositions, 
        // avatarConfig: state.avatarConfig, 
      }),
    }
  )
)
