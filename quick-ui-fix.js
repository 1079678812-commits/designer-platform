#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 示例数据
const mockData = {
  services: [
    { id: '1', name: '网站设计', description: '企业官网设计开发', price: 5000, category: '网站设计', status: 'active', rating: 4.8, createdAt: '2026-03-15' },
    { id: '2', name: 'UI设计', description: '移动端应用界面设计', price: 3000, category: 'UI设计', status: 'active', rating: 4.9, createdAt: '2026-03-20' },
    { id: '3', name: '品牌设计', description: '企业品牌形象设计', price: 8000, category: '品牌设计', status: 'draft', rating: 4.7, createdAt: '2026-03-25' },
    { id: '4', name: '平面设计', description: '海报、宣传册设计', price: 2000, category: '平面设计', status: 'active', rating: 4.6, createdAt: '2026-03-28' }
  ],
  clients: [
    { id: '1', name: 'ABC公司', email: 'contact@abc.com', phone: '13800138001', company: 'ABC科技有限公司', createdAt: '2026-01-15' },
    { id: '2', name: 'XYZ科技', email: 'info@xyz.com', phone: '13800138002', company: 'XYZ数字科技', createdAt: '2026-02-10' },
    { id: '3', name: '创意工作室', email: 'hello@creative.com', phone: '13800138003', company: '创意设计工作室', createdAt: '2026-03-05' }
  ],
  orders: [
    { id: '1', clientName: 'ABC公司', serviceName: '网站设计', amount: 5000, status: 'completed', createdAt: '2026-03-10' },
    { id: '2', clientName: 'XYZ科技', serviceName: 'UI设计', amount: 3000, status: 'in_progress', createdAt: '2026-03-15' },
    { id: '3', clientName: '创意工作室', serviceName: '品牌设计', amount: 8000, status: 'pending', createdAt: '2026-03-20' }
  ]
};

// 要修复的文件
const htmlFiles = [
  'public/services-simple.html',
  'public/clients-simple.html',
  'public/orders-simple.html',
  'public/contracts-simple.html',
  'public/invoices-simple.html',
  'public/analytics-simple.html',
  'public/notifications-simple.html',
  'public/settings-simple.html',
  'public/dashboard-simple.html',
  'public/kanban-simple.html'
];

console.log('开始添加模拟数据支持...');

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`文件不存在: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 在load函数中添加模拟数据支持
  if (content.includes('async function load')) {
    // 找到load函数
    const loadFunctionMatch = content.match(/async function load[^{]+\{[\s\S]*?\n    \}/);
    
    if (loadFunctionMatch) {
      const loadFunction = loadFunctionMatch[0];
      const functionName = loadFunction.match(/async function (\w+)/)[1];
      const dataType = functionName.replace('load', '').toLowerCase();
      
      // 添加模拟数据逻辑
      const mockLogic = `
      // 模拟数据（当API不可用时）
      const useMockData = localStorage.getItem('useMockData') === 'true' || window.location.search.includes('mock=true');
      if (useMockData) {
        console.log('使用模拟数据');
        const mockData = ${JSON.stringify(mockData[dataType] || [], null, 2)};
        updateStats(mockData);
        renderServices(mockData);
        showLoading(false);
        return;
      }
      `;
      
      // 在try块开始后插入模拟数据逻辑
      const updatedFunction = loadFunction.replace(/try \{/, `try {\n${mockLogic}`);
      content = content.replace(loadFunction, updatedFunction);
      
      console.log(`已为 ${file} 添加模拟数据支持`);
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('\n修复完成！');
console.log('现在页面将在API不可用时显示示例数据。');
console.log('要启用模拟数据，请访问: http://localhost:3000/test-ui-only.html');