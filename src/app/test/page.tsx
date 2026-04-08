'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [message, setMessage] = useState('初始状态')
  
  useEffect(() => {
    console.log('TestPage: useEffect执行')
    setMessage('组件已加载')
    
    // 测试API调用
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        console.log('API响应:', data)
        setMessage(`API成功: ${data.data?.length || 0}个服务`)
      })
      .catch(err => {
        console.error('API错误:', err)
        setMessage(`API错误: ${err.message}`)
      })
  }, [])
  
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>React测试页面</h1>
      <p>状态: {message}</p>
      <button onClick={() => setMessage('按钮点击')}>测试按钮</button>
    </div>
  )
}