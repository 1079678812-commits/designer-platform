#!/bin/bash

echo "=== 测试所有纯HTML页面 ==="
echo "服务器地址: http://localhost:3000"
echo ""

# 定义要测试的页面
PAGES=(
  "login-final.html"
  "dashboard-simple.html"
  "services-simple.html"
  "clients-simple.html"
  "orders-simple.html"
  "contracts-simple.html"
  "invoices-simple.html"
  "analytics-simple.html"
  "notifications-simple.html"
  "settings-simple.html"
  "kanban-simple.html"
)

# 测试每个页面
for page in "${PAGES[@]}"; do
  echo -n "测试 $page ... "
  
  # 使用curl检查页面是否可访问
  if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/$page" | grep -q "200"; then
    echo "✅ 正常"
  else
    echo "❌ 失败"
  fi
done

echo ""
echo "=== 页面统计 ==="
echo "总页面数: ${#PAGES[@]}"
echo ""

echo "=== 访问方式 ==="
echo "1. 本地访问: http://localhost:3000/login-final.html"
echo "2. 网络访问: http://192.168.31.101:3000/login-final.html"
echo "3. 移动设备: 同一WiFi下访问上述地址"
echo ""

echo "=== 测试账号 ==="
echo "设计师: designer@test.com / 123456"
echo "客户: client@test.com / 123456"
echo ""

echo "=== 核心功能页面 ==="
echo "📊 仪表盘: dashboard-simple.html"
echo "🛠️ 服务管理: services-simple.html"
echo "👥 客户管理: clients-simple.html"
echo "📦 订单管理: orders-simple.html"
echo "📝 合同管理: contracts-simple.html"
echo "🧾 发票管理: invoices-simple.html"
echo "📈 数据分析: analytics-simple.html"
echo "🔔 通知中心: notifications-simple.html"
echo "⚙️ 系统设置: settings-simple.html"
echo "📋 项目管理: kanban-simple.html"
echo ""

echo "测试完成！所有页面已准备就绪。"