import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 创建管理员客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface ConfigItem {
  id: string
  name: string
  description: string
  config_data: any
  is_active: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { configData } = body

    // 验证数据格式
    if (!Array.isArray(configData)) {
      return NextResponse.json(
        { error: '配置数据必须是数组格式' },
        { status: 400 }
      )
    }

    // 验证每个配置项的格式
    for (const item of configData) {
      if (!item.id || !item.name || !item.description || item.config_data === undefined || typeof item.is_active !== 'boolean') {
        return NextResponse.json(
          { error: `配置项格式错误：${JSON.stringify(item)}` },
          { status: 400 }
        )
      }
    }

    // 检查 layout_configs 表是否存在，如果不存在则创建
    const { error: tableError } = await supabaseAdmin
      .from('layout_configs')
      .select('id')
      .limit(1)

    if (tableError && tableError.message.includes('relation "public.layout_configs" does not exist')) {
      // 创建 layout_configs 表
      const { error: createTableError } = await supabaseAdmin.rpc('create_layout_configs_table')
      
      if (createTableError) {
        // 如果 RPC 函数不存在，直接执行 SQL
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.layout_configs (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            config_data JSONB NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
          
          -- 创建索引
          CREATE INDEX IF NOT EXISTS idx_layout_configs_active ON public.layout_configs(is_active);
          CREATE INDEX IF NOT EXISTS idx_layout_configs_created_at ON public.layout_configs(created_at);
          
          -- 启用 RLS
          ALTER TABLE public.layout_configs ENABLE ROW LEVEL SECURITY;
          
          -- 创建 RLS 策略
          CREATE POLICY "Allow read access for all users" ON public.layout_configs
            FOR SELECT USING (true);
          
          CREATE POLICY "Allow full access for authenticated users" ON public.layout_configs
            FOR ALL USING (auth.role() = 'authenticated');
        `
        
        const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', { sql: createTableSQL })
        
        if (sqlError) {
          console.error('创建表失败:', sqlError)
          return NextResponse.json(
            { error: '创建配置表失败，请联系管理员' },
            { status: 500 }
          )
        }
      }
    }

    // 批量插入配置数据
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const item of configData) {
      try {
        const { error } = await supabaseAdmin
          .from('layout_configs')
          .upsert({
            id: item.id,
            name: item.name,
            description: item.description,
            config_data: item.config_data,
            is_active: item.is_active,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (error) {
          errorCount++
          errors.push(`${item.id}: ${error.message}`)
        } else {
          successCount++
        }
      } catch (itemError) {
        errorCount++
        errors.push(`${item.id}: ${itemError}`)
      }
    }

    const response = {
      success: true,
      count: successCount,
      total: configData.length,
      errors: errorCount > 0 ? errors : undefined
    }

    if (errorCount > 0) {
      response.success = false
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('导入配置失败:', error)
    return NextResponse.json(
      { error: '导入配置失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

// 获取现有配置
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('layout_configs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: '获取配置失败: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ configs: data || [] })

  } catch (error) {
    console.error('获取配置失败:', error)
    return NextResponse.json(
      { error: '获取配置失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
}