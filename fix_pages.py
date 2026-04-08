#!/usr/bin/env python3
import os
import re

# 要修复的页面列表
pages = [
    'contracts-simple.html',
    'invoices-simple.html',
    'analytics-simple.html',
    'notifications-simple.html',
    'settings-simple.html'
]

# 要添加的showLoading函数
show_loading_function = '''    // 显示/隐藏加载状态
    function showLoading(show) {
      const loadingDiv = document.getElementById('loading');
      const contentDiv = document.getElementById('content-container');
      if (loadingDiv) loadingDiv.style.display = show ? 'block' : 'none';
      if (contentDiv) contentDiv.style.display = show ? 'none' : 'block';
    }'''

for page in pages:
    filepath = f'public/{page}'
    if not os.path.exists(filepath):
        print(f"文件不存在: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否已经有showLoading函数
    if 'function showLoading' in content:
        print(f"{page}: 已有showLoading函数")
        continue
    
    # 查找showError函数并在之前插入showLoading函数
    if 'function showError' in content:
        # 在showError函数之前插入
        new_content = content.replace('function showError', show_loading_function + '\n\n    // 显示错误信息\n    function showError')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"{page}: 已添加showLoading函数")
    else:
        print(f"{page}: 未找到showError函数，无法自动添加")

print("修复完成！")