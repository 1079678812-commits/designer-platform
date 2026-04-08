#!/bin/bash

# 更新所有页面使用TopNav替代Sidebar

PAGES=(
  "src/app/dashboard/page.tsx"
  "src/app/clients/page.tsx"
  "src/app/orders/page.tsx"
  "src/app/kanban/page.tsx"
  "src/app/contracts/page.tsx"
  "src/app/invoices/page.tsx"
  "src/app/analytics/page.tsx"
  "src/app/notifications/page.tsx"
  "src/app/settings/page.tsx"
)

echo "开始更新页面..."

for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    echo "更新: $page"
    
    # 替换Sidebar导入为TopNav
    sed -i '' 's/import Sidebar from .*$/import TopNav from \"@\/components\/TopNav\"/g' "$page"
    
    # 替换Sidebar组件为TopNav
    sed -i '' 's/<Sidebar \/>/<TopNav \/>/g' "$page"
    
    # 更新容器类
    sed -i '' 's/className="flex min-h-screen bg-\[#F5F6FA\]"/className="min-h-screen bg-\[#F5F6FA\]"/g' "$page"
    sed -i '' 's/className="flex-1 p-8 overflow-auto"/className="max-w-7xl mx-auto p-4 md:p-8"/g' "$page"
  else
    echo "跳过: $page (文件不存在)"
  fi
done

echo "更新完成！"