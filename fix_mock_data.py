#!/usr/bin/env python3
import os
import re

# 页面配置：页面文件名 -> 模拟数据函数名和内容
page_configs = {
    'contracts-simple.html': {
        'function_name': 'getMockContracts',
        'mock_data': '''    // 模拟合同数据
    function getMockContracts() {
      return [
        {
          id: '1',
          name: '品牌设计合同',
          client: '张先生',
          amount: 12000,
          createdAt: '2026-03-15',
          status: 'signed'
        },
        {
          id: '2',
          name: 'UI设计合同',
          client: '李女士',
          amount: 8000,
          createdAt: '2026-03-20',
          status: 'pending'
        },
        {
          id: '3',
          name: '网站设计合同',
          client: '王先生',
          amount: 15000,
          createdAt: '2026-03-25',
          status: 'draft'
        }
      ];
    }'''
    },
    'invoices-simple.html': {
        'function_name': 'getMockInvoices',
        'mock_data': '''    // 模拟发票数据
    function getMockInvoices() {
      return [
        {
          id: '1',
          invoiceNumber: 'INV-202404001',
          client: '张先生',
          amount: 12000,
          issueDate: '2026-04-01',
          dueDate: '2026-04-15',
          status: 'sent'
        },
        {
          id: '2',
          invoiceNumber: 'INV-202404002',
          client: '李女士',
          amount: 8000,
          issueDate: '2026-04-02',
          dueDate: '2026-04-16',
          status: 'paid'
        },
        {
          id: '3',
          invoiceNumber: 'INV-202404003',
          client: '王先生',
          amount: 15000,
          issueDate: '2026-03-28',
          dueDate: '2026-04-12',
          status: 'overdue'
        }
      ];
    }'''
    },
    'analytics-simple.html': {
        'function_name': 'getMockAnalytics',
        'mock_data': '''    // 模拟分析数据
    function getMockAnalytics() {
      return {
        revenueData: [12000, 8000, 15000, 5000, 3000, 10000, 7000],
        clientRanking: [
          { name: '张先生', revenue: 32000, projects: 3 },
          { name: '李女士', revenue: 24000, projects: 2 },
          { name: '王先生', revenue: 15000, projects: 1 },
          { name: '赵女士', revenue: 10000, projects: 1 },
          { name: '刘先生', revenue: 8000, projects: 1 }
        ],
        serviceDistribution: [
          { name: '品牌设计', value: 35 },
          { name: 'UI设计', value: 25 },
          { name: '网站设计', value: 20 },
          { name: '平面设计', value: 15 },
          { name: '其他', value: 5 }
        ]
      };
    }'''
    },
    'notifications-simple.html': {
        'function_name': 'getMockNotifications',
        'mock_data': '''    // 模拟通知数据
    function getMockNotifications() {
      return [
        {
          id: '1',
          title: '新订单通知',
          message: '张先生提交了新的品牌设计订单',
          type: 'order',
          timestamp: '2026-04-05 09:30',
          read: false
        },
        {
          id: '2',
          title: '合同待签署',
          message: '与李女士的UI设计合同等待您的签署',
          type: 'contract',
          timestamp: '2026-04-04 14:20',
          read: false
        },
        {
          id: '3',
          title: '发票已支付',
          message: '王先生已支付网站设计发票 ¥15,000',
          type: 'invoice',
          timestamp: '2026-04-03 11:45',
          read: true
        },
        {
          id: '4',
          title: '系统维护通知',
          message: '系统将于今晚23:00-01:00进行维护',
          type: 'system',
          timestamp: '2026-04-02 16:10',
          read: true
        }
      ];
    }'''
    },
    'settings-simple.html': {
        'function_name': 'getMockSettings',
        'mock_data': '''    // 模拟设置数据
    function getMockSettings() {
      return {
        profile: {
          name: '设计师张三',
          email: 'zhangsan@designer.com',
          phone: '13800138000',
          avatar: 'https://example.com/avatar.jpg'
        },
        notifications: {
          emailNotifications: true,
          orderNotifications: true,
          contractNotifications: true,
          invoiceNotifications: true
        },
        security: {
          twoFactorAuth: false,
          loginAlerts: true
        }
      };
    }'''
    }
}

for page, config in page_configs.items():
    filepath = f'public/{page}'
    if not os.path.exists(filepath):
        print(f"文件不存在: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    function_name = config['function_name']
    mock_data = config['mock_data']
    
    # 检查是否已经有模拟数据函数
    if function_name in content:
        print(f"{page}: 已有{function_name}函数")
        continue
    
    # 查找空数组的模拟数据并替换
    empty_array_pattern = r'const mockData = \[\];'
    if re.search(empty_array_pattern, content):
        new_content = re.sub(
            empty_array_pattern,
            f'const mockData = {function_name}();',
            content
        )
        
        # 在render函数之前插入模拟数据函数
        render_pattern = r'function render[A-Z]'
        match = re.search(render_pattern, new_content)
        if match:
            insert_pos = match.start()
            # 在render函数之前插入模拟数据函数
            final_content = new_content[:insert_pos] + '\n\n' + mock_data + '\n\n' + new_content[insert_pos:]
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(final_content)
            print(f"{page}: 已添加{function_name}函数并更新模拟数据")
        else:
            print(f"{page}: 未找到render函数，无法插入模拟数据函数")
    else:
        print(f"{page}: 未找到空数组模拟数据")

print("模拟数据修复完成！")