#!/bin/bash

# 更新所有页面，移除useSession依赖，简化数据获取

PAGES=(
  "src/app/clients/page.tsx"
  "src/app/orders/page.tsx"
  "src/app/dashboard/page.tsx"
  "src/app/kanban/page.tsx"
  "src/app/contracts/page.tsx"
  "src/app/invoices/page.tsx"
  "src/app/analytics/page.tsx"
  "src/app/notifications/page.tsx"
  "src/app/settings/page.tsx"
)

for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    echo "更新: $page"
    
    # 移除 useSession 导入
    sed -i '' 's/import { useSession } from '\''next-auth\/react'\''//g' "$page"
    sed -i '' 's/import { useSession } from "next-auth\/react"//g' "$page"
    
    # 简化 useEffect - 移除session检查
    sed -i '' 's/useEffect(() => { if (status === '\''unauthenticated'\'') router.push('\''\/login'\'') }, \[status, router\])//g' "$page"
    sed -i '' 's/useEffect(() => { if (status === "unauthenticated") router.push("\/login") }, \[status, router\])//g' "$page"
    
    # 简化数据获取 - 直接调用fetch函数
    sed -i '' 's/useEffect(() => { if (session) fetchData() }, \[session\])/useEffect(() => { fetchData() }, \[\])/g' "$page"
    sed -i '' 's/useEffect(() => { if (session) { fetchData() } }, \[session\])/useEffect(() => { fetchData() }, \[\])/g' "$page"
    
    # 移除 session, status 变量声明
    sed -i '' 's/const { data: session, status } = useSession()//g' "$page"
    sed -i '' 's/const { data: session } = useSession()//g' "$page"
    
    echo "  ✓ 完成"
  else
    echo "  ✗ 文件不存在: $page"
  fi
done

echo "所有页面更新完成！"