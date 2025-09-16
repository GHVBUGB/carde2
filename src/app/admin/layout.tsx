export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 简化布局，不进行权限检查
  // 权限检查由各个页面自己处理
  return <>{children}</>
}
