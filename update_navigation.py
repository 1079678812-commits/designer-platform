#!/usr/bin/env python3
import os
import re

# 要更新的页面列表
pages = [
    'dashboard-simple.html',
    'services-simple.html',
    'clients-simple.html',
    'orders-simple.html',
    'contracts-simple.html',
    'invoices-simple.html',
    'analytics-simple.html',
    'notifications-simple.html',
    'settings-simple.html',
    'kanban-simple.html'
]

# 新的CSS样式（左侧导航）
new_nav_css = '''    /* 左侧导航 */
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      width: 240px;
      height: 100vh;
      background: white;
      border-right: 1px solid #E5E6EB;
      padding: 20px;
      overflow-y: auto;
      z-index: 1000;
    }
    
    .sidebar-header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #E5E6EB;
    }
    
    .sidebar-title {
      font-size: 18px;
      font-weight: 700;
      color: #1D2129;
      margin-bottom: 4px;
    }
    
    .sidebar-subtitle {
      font-size: 12px;
      color: #86909C;
    }
    
    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #1D2129;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s;
    }
    
    .nav-link:hover {
      background: #F5F6FA;
      color: #00B578;
    }
    
    .nav-link.active {
      background: rgba(0, 181, 120, 0.1);
      color: #00B578;
      font-weight: 500;
    }
    
    .nav-icon {
      font-size: 18px;
      width: 24px;
      text-align: center;
    }
    
    .nav-text {
      font-size: 14px;
    }
    
    /* 主内容区域 */
    .main-content {
      margin-left: 240px;
      padding: 20px;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        width: 200px;
        transform: translateX(-100%);
        transition: transform 0.3s;
      }
      
      .sidebar.open {
        transform: translateX(0);
      }
      
      .main-content {
        margin-left: 0;
      }
      
      .mobile-menu-btn {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1001;
        background: white;
        border: 1px solid #E5E6EB;
        border-radius: 8px;
        padding: 8px 12px;
        cursor: pointer;
      }
    }'''

# 新的导航HTML（左侧）
new_nav_html = '''    <!-- 左侧导航 -->
    <div class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-title">设计师平台</div>
        <div class="sidebar-subtitle">管理您的设计业务</div>
      </div>
      
      <div class="nav-menu">
        <a href="/dashboard-simple.html" class="nav-link {dashboard_active}">
          <div class="nav-icon">📊</div>
          <div class="nav-text">仪表盘</div>
        </a>
        <a href="/services-simple.html" class="nav-link {services_active}">
          <div class="nav-icon">🛠️</div>
          <div class="nav-text">服务管理</div>
        </a>
        <a href="/clients-simple.html" class="nav-link {clients_active}">
          <div class="nav-icon">👥</div>
          <div class="nav-text">客户管理</div>
        </a>
        <a href="/orders-simple.html" class="nav-link {orders_active}">
          <div class="nav-icon">📦</div>
          <div class="nav-text">订单管理</div>
        </a>
        <a href="/contracts-simple.html" class="nav-link {contracts_active}">
          <div class="nav-icon">📝</div>
          <div class="nav-text">合同管理</div>
        </a>
        <a href="/invoices-simple.html" class="nav-link {invoices_active}">
          <div class="nav-icon">🧾</div>
          <div class="nav-text">发票管理</div>
        </a>
        <a href="/analytics-simple.html" class="nav-link {analytics_active}">
          <div class="nav-icon">📈</div>
          <div class="nav-text">数据分析</div>
        </a>
        <a href="/notifications-simple.html" class="nav-link {notifications_active}">
          <div class="nav-icon">🔔</div>
          <div class="nav-text">通知中心</div>
        </a>
        <a href="/settings-simple.html" class="nav-link {settings_active}">
          <div class="nav-icon">⚙️</div>
          <div class="nav-text">系统设置</div>
        </a>
        <a href="/kanban-simple.html" class="nav-link {kanban_active}">
          <div class="nav-icon">📋</div>
          <div class="nav-text">项目管理</div>
        </a>
      </div>
    </div>
    
    <!-- 移动端菜单按钮 -->
    <button class="mobile-menu-btn" id="mobileMenuBtn" style="display: none;">☰</button>
    
    <!-- 主内容 -->
    <div class="main-content">'''

# 移动端菜单JavaScript
mobile_js = '''    // 移动端菜单切换
    document.addEventListener('DOMContentLoaded', () => {
      const mobileMenuBtn = document.getElementById('mobileMenuBtn');
      const sidebar = document.getElementById('sidebar');
      
      if (mobileMenuBtn && sidebar) {
        // 检查是否为移动端
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          mobileMenuBtn.style.display = 'block';
          
          mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
          });
          
          // 点击内容区域关闭菜单
          document.querySelector('.main-content').addEventListener('click', () => {
            if (sidebar.classList.contains('open')) {
              sidebar.classList.remove('open');
            }
          });
        }
      }
      
      // 设置当前页面激活状态
      const currentPage = window.location.pathname.split('/').pop() || 'dashboard-simple.html';
      const navLinks = document.querySelectorAll('.nav-link');
      
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
          link.classList.add('active');
        }
      });
    });'''

for page_file in pages:
    filepath = f'public/{page_file}'
    if not os.path.exists(filepath):
        print(f"文件不存在: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 获取当前页面名称（用于设置active状态）
    page_name = page_file.replace('-simple.html', '')
    
    # 创建active状态字典
    active_states = {}
    for p in ['dashboard', 'services', 'clients', 'orders', 'contracts', 'invoices', 'analytics', 'notifications', 'settings', 'kanban']:
        active_states[f'{p}_active'] = 'active' if p == page_name else ''
    
    # 替换导航HTML
    nav_html_with_active = new_nav_html.format(**active_states)
    
    # 1. 移除旧的顶部导航CSS
    # 查找并移除旧的.nav样式
    old_nav_pattern = r'\.nav\s*\{[^}]*\}'
    content = re.sub(old_nav_pattern, '', content, flags=re.DOTALL)
    
    # 2. 添加新的左侧导航CSS到style标签中
    style_end_pattern = r'</style>'
    if re.search(style_end_pattern, content):
        # 在</style>之前插入新CSS
        content = re.sub(style_end_pattern, new_nav_css + '\n  </style>', content)
    
    # 3. 移除旧的顶部导航HTML
    # 查找并移除旧的导航div
    old_nav_html_pattern = r'<!--\s*导航\s*-->.*?<!--\s*标题\s*-->'
    content = re.sub(old_nav_html_pattern, '<!-- 标题 -->', content, flags=re.DOTALL)
    
    # 4. 在<body>标签后添加新的左侧导航
    body_pattern = r'<body>\s*<div class="container">'
    if re.search(body_pattern, content):
        # 在<body>后添加新导航
        content = re.sub(body_pattern, f'<body>\n{nav_html_with_active}\n    <div class="container">', content)
    
    # 5. 在</body>前添加移动端菜单JavaScript
    body_end_pattern = r'</body>'
    if re.search(body_end_pattern, content):
        # 在</body>之前插入JavaScript
        content = re.sub(body_end_pattern, f'  <script>\n{mobile_js}\n  </script>\n</body>', content)
    
    # 6. 调整body样式，移除padding
    body_style_pattern = r'body\s*\{[^}]*padding:\s*20px;[^}]*\}'
    content = re.sub(body_style_pattern, 'body { background: #F5F6FA; min-height: 100vh; }', content)
    
    # 7. 调整.container样式，移除margin
    container_style_pattern = r'\.container\s*\{[^}]*margin:\s*0 auto;[^}]*\}'
    content = re.sub(container_style_pattern, '.container { max-width: 1200px; }', content)
    
    # 保存更新后的文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"已更新: {page_file}")

print("\n所有页面导航已更新为左侧显示！")
print("\n注意事项:")
print("1. 左侧导航宽度为240px")
print("2. 主内容区域自动向右偏移240px")
print("3. 移动端自动隐藏导航，显示菜单按钮")
print("4. 当前页面导航项会高亮显示")
print("5. 所有页面保持统一的导航结构")