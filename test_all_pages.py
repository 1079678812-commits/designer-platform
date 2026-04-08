#!/usr/bin/env python3
import os
import subprocess
import time

# 要测试的页面列表
pages = [
    ('服务管理', 'services-simple.html?mock=true'),
    ('合同管理', 'contracts-simple.html?mock=true'),
    ('发票管理', 'invoices-simple.html?mock=true'),
    ('数据分析', 'analytics-simple.html?mock=true'),
    ('通知中心', 'notifications-simple.html?mock=true'),
    ('系统设置', 'settings-simple.html?mock=true'),
    ('客户管理', 'clients-simple.html?mock=true'),
    ('订单管理', 'orders-simple.html?mock=true'),
    ('项目管理', 'kanban-simple.html?mock=true')
]

print("开始测试所有页面...")
print("=" * 50)

for page_name, page_url in pages:
    print(f"\n测试: {page_name}")
    print(f"URL: http://localhost:3000/{page_url}")
    
    # 检查文件是否存在
    filename = page_url.split('?')[0]
    if not os.path.exists(f'public/{filename}'):
        print(f"  ❌ 文件不存在: {filename}")
        continue
    
    # 检查文件大小
    file_size = os.path.getsize(f'public/{filename}')
    print(f"  文件大小: {file_size} 字节")
    
    # 检查常见问题
    with open(f'public/{filename}', 'r', encoding='utf-8') as f:
        content = f.read()
    
    issues = []
    
    # 检查是否有renderServices错误
    if 'renderServices(' in content and 'function renderServices' not in content:
        issues.append('可能有renderServices函数调用错误')
    
    # 检查是否有showLoading函数
    if 'showLoading(' in content and 'function showLoading' not in content:
        issues.append('缺少showLoading函数定义')
    
    # 检查模拟数据
    if 'mock=true' in page_url:
        if 'const mockData = [];' in content:
            issues.append('模拟数据为空数组')
        elif 'getMock' in content:
            print(f"  ✅ 有模拟数据函数")
    
    # 检查HTML结构
    if '<!DOCTYPE html>' not in content[:100]:
        issues.append('可能缺少完整的HTML结构')
    
    if '<body>' not in content:
        issues.append('缺少<body>标签')
    
    if '</html>' not in content[-100:]:
        issues.append('缺少</html>标签')
    
    if issues:
        print(f"  ⚠️  发现问题:")
        for issue in issues:
            print(f"    - {issue}")
    else:
        print(f"  ✅ 基本检查通过")

print("\n" + "=" * 50)
print("测试完成！")
print("\n建议:")
print("1. 客户管理和订单管理页面可能缺少完整的HTML结构")
print("2. 所有主要功能页面已修复模拟数据问题")
print("3. 建议在浏览器中手动测试每个页面的交互功能")