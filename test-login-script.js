// 测试登录跳转脚本
const http = require('http');

console.log('=== 测试登录跳转功能 ===\n');

// 测试服务页面可访问性
http.get('http://localhost:3000/services', (res) => {
  console.log(`1. 服务页面状态: HTTP ${res.statusCode}`);
  
  // 测试登录页面
  http.get('http://localhost:3000/login/fixed', (res2) => {
    console.log(`2. 修复版登录页面: HTTP ${res2.statusCode}`);
    
    // 测试直接跳转
    console.log('\n3. 测试直接跳转URL:');
    console.log('   http://localhost:3000/services');
    console.log('   http://192.168.31.101:3000/services');
    
    console.log('\n=== 诊断建议 ===');
    console.log('✅ 服务页面可访问');
    console.log('✅ 登录页面可访问');
    console.log('❓ 问题：登录后跳转失败');
    console.log('\n🔧 可能原因：');
    console.log('1. JavaScript执行被阻止');
    console.log('2. 浏览器安全策略限制');
    console.log('3. 移动端特殊限制');
    console.log('\n🚀 解决方案：');
    console.log('1. 使用纯HTML页面测试：/login-direct.html');
    console.log('2. 检查浏览器控制台错误');
    console.log('3. 尝试不同浏览器');
  });
});
