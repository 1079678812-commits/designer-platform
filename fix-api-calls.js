#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// API映射表：旧API -> 新API
const apiMappings = {
  '/api/services': '/api/data?type=services',
  '/api/clients': '/api/data?type=clients',
  '/api/orders': '/api/data?type=orders',
  '/api/contracts': '/api/data?type=contracts',
  '/api/invoices': '/api/data?type=invoices',
  '/api/notifications': '/api/data?type=notifications',
  '/api/analytics/orders': '/api/data?type=analytics',
  '/api/analytics/clients': '/api/data?type=analytics',
  '/api/analytics/services': '/api/data?type=analytics',
  '/api/user/profile': '/api/data?type=profile',
  '/api/user/settings': '/api/data?type=settings'
};

// 要修改的文件
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

console.log('开始修复API调用...');

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`文件不存在: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 替换API调用
  for (const [oldApi, newApi] of Object.entries(apiMappings)) {
    const regex = new RegExp(`fetch\\(['"]${oldApi}([^'"]*)['"]\\)`, 'g');
    const matches = content.match(regex);
    
    if (matches) {
      console.log(`在 ${file} 中找到: ${matches.length} 个 ${oldApi} 调用`);
      content = content.replace(regex, `fetch('/api/data?type=${oldApi.split('/').pop()}')`);
      modified = true;
    }
  }
  
  // 替换特定的API路径
  content = content.replace(/fetch\('\/api\/analytics\/[^']*'/g, "fetch('/api/data?type=analytics'");
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`已更新: ${file}`);
  } else {
    console.log(`无需更新: ${file}`);
  }
});

console.log('\n修复完成！');
console.log('现在所有页面将使用统一的 /api/data 接口。');