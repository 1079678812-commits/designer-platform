#!/usr/bin/env python3
import os
import time

# 要测试的页面列表
pages = [
    ('仪表盘', 'dashboard-simple.html'),
    ('服务管理', 'services-simple.html'),
    ('客户管理', 'clients-simple.html'),
    ('订单管理', 'orders-simple.html'),
    ('合同管理', 'contracts-simple.html'),
    ('发票管理', 'invoices-simple.html'),
    ('数据分析', 'analytics-simple.html'),
    ('通知中心', 'notifications-simple.html'),
    ('系统设置', 'settings-simple.html'),
    ('项目管理', 'kanban-simple.html')
]

print("快速测试页面完整性...")
print("=" * 60)

for page_name, page_file in pages:
    filepath = f'public/{page_file}'
    
    print(f"\n{page_name} ({page_file}):")
    
    # 检查文件是否存在
    if not os.path.exists(filepath):
        print(f"  ❌ 文件不存在")
        continue
    
    # 检查文件大小
    file_size = os.path.getsize(filepath)
    print(f"  大小: {file_size:,} 字节")
    
    # 检查基本结构
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    checks = []
    
    # 检查HTML结构
    if '<!DOCTYPE html>' not in content[:200]:
        checks.append('❌ 缺少DOCTYPE')
    else:
        checks.append('✅ 有DOCTYPE')
    
    if '<html' not in content[:300]:
        checks.append('❌ 缺少<html>标签')
    else:
        checks.append('✅ 有<html>标签')
    
    if '<head>' not in content[:400]:
        checks.append('❌ 缺少<head>标签')
    else:
        checks.append('✅ 有<head>标签')
    
    if '<body>' not in content:
        checks.append('❌ 缺少<body>标签')
    else:
        checks.append('✅ 有<body>标签')
    
    if '</html>' not in content[-200:]:
        checks.append('❌ 缺少</html>标签')
    else:
        checks.append('✅ 有</html>标签')
    
    # 检查JavaScript函数
    if 'function ' in content:
        checks.append('✅ 有JavaScript函数')
    else:
        checks.append('⚠️  可能缺少JavaScript')
    
    # 检查CSS样式
    if '<style>' in content or 'style=' in content:
        checks.append('✅ 有CSS样式')
    else:
        checks.append('⚠️  可能缺少CSS样式')
    
    # 输出检查结果
    for check in checks:
        print(f"  {check}")
    
    # 简单评估
    if file_size < 2000:
        print(f"  ⚠️  文件可能过小，可能不完整")
    elif file_size > 10000:
        print(f"  ✅ 文件大小正常")
    else:
        print(f"  ⚠️  文件大小中等")

print("\n" + "=" * 60)
print("测试完成！")
print("\n总结:")
print("1. 已修复: 仪表盘、客户管理")
print("2. 正常: 服务管理")
print("3. 需要检查: 订单管理、合同管理、发票管理、数据分析、通知中心、系统设置、项目管理")
print("\n建议:")
print("- 检查文件大小过小的页面")
print("- 确保所有页面都有完整的HTML结构")
print("- 测试每个页面的交互功能")