#!/bin/bash

echo "=== 设计师平台登录功能测试 ==="
echo "测试时间: $(date)"
echo ""

# 检查服务器状态
echo "1. 检查服务器状态..."
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$SERVER_STATUS" = "200" ]; then
    echo "   ✅ 服务器正常 (HTTP $SERVER_STATUS)"
else
    echo "   ❌ 服务器异常 (HTTP $SERVER_STATUS)"
    exit 1
fi

echo ""
echo "2. 测试各登录页面可访问性..."

PAGES=(
    "/login"
    "/login/fixed"
    "/login/simple"
    "/services"
    "/dashboard"
)

for page in "${PAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$page")
    if [ "$STATUS" = "200" ]; then
        echo "   ✅ $page 可访问 (HTTP $STATUS)"
    else
        echo "   ❌ $page 不可访问 (HTTP $STATUS)"
    fi
done

echo ""
echo "3. 测试静态页面..."
STATIC_PAGES=(
    "/login-direct.html"
    "/test-login.html"
    "/index-simple.html"
    "/mobile-test.html"
)

for page in "${STATIC_PAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$page")
    if [ "$STATUS" = "200" ]; then
        echo "   ✅ $page 可访问 (HTTP $STATUS)"
    else
        echo "   ❌ $page 不可访问 (HTTP $STATUS)"
    fi
done

echo ""
echo "4. 检查服务器日志错误..."
LOG_ERRORS=$(tail -100 /tmp/next8.log 2>/dev/null | grep -i "error\|Error\|ERROR" | head -5)
if [ -n "$LOG_ERRORS" ]; then
    echo "   ⚠️  发现服务器错误："
    echo "$LOG_ERRORS" | sed 's/^/      /'
else
    echo "   ✅ 未发现服务器错误"
fi

echo ""
echo "=== 测试完成 ==="
echo ""
echo "🎯 推荐测试方法："
echo "1. 访问 http://192.168.31.101:3000/login/fixed"
echo "2. 点击'立即登录'按钮"
echo "3. 应该看到提示并跳转到服务页面"
echo ""
echo "🔄 备用测试方法："
echo "1. 访问 http://192.168.31.101:3000/login-direct.html"
echo "2. 点击'测试登录功能'按钮"
echo "3. 使用纯HTML/JS测试跳转"
echo ""
echo "📱 移动端访问："
echo "在手机浏览器中输入：http://192.168.31.101:3000/login/fixed"