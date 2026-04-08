// 统一API调用工具

const API_BASE = ''

interface ApiOptions extends RequestInit {
  params?: Record<string, string>
}

async function apiFetch(url: string, options: ApiOptions = {}): Promise<Response> {
  const { params, ...init } = options

  let fullUrl = `${API_BASE}${url}`
  if (params) {
    const searchParams = new URLSearchParams(params)
    fullUrl += `?${searchParams.toString()}`
  }

  const res = await fetch(fullUrl, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: '请求失败' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res
}

export async function apiGet<T = any>(url: string, params?: Record<string, string>): Promise<T> {
  const res = await apiFetch(url, { params, method: 'GET' })
  return res.json()
}

export async function apiPost<T = any>(url: string, data?: any): Promise<T> {
  const res = await apiFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
  return res.json()
}

export async function apiPut<T = any>(url: string, data?: any): Promise<T> {
  const res = await apiFetch(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
  return res.json()
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  const res = await apiFetch(url, { method: 'DELETE' })
  return res.json()
}

export async function apiUpload(url: string, file: File): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error('上传失败')
  }

  return res.json()
}

export const api = {
  // 用户
  users: {
    get: () => apiGet('/api/users'),
    update: (data: any) => apiPut('/api/users', data),
    register: (data: any) => apiPost('/api/users/register', data),
  },

  // 服务
  services: {
    list: (params?: Record<string, string>) => apiGet('/api/services', params),
    get: (id: string) => apiGet(`/api/services/${id}`),
    create: (data: any) => apiPost('/api/services', data),
    update: (id: string, data: any) => apiPut(`/api/services/${id}`, data),
    delete: (id: string) => apiDelete(`/api/services/${id}`),
  },

  // 客户
  clients: {
    list: (params?: Record<string, string>) => apiGet('/api/clients', params),
    get: (id: string) => apiGet(`/api/clients/${id}`),
    create: (data: any) => apiPost('/api/clients', data),
    update: (id: string, data: any) => apiPut(`/api/clients/${id}`, data),
    delete: (id: string) => apiDelete(`/api/clients/${id}`),
  },

  // 订单
  orders: {
    list: (params?: Record<string, string>) => apiGet('/api/orders', params),
    get: (id: string) => apiGet(`/api/orders/${id}`),
    create: (data: any) => apiPost('/api/orders', data),
    update: (id: string, data: any) => apiPut(`/api/orders/${id}`, data),
    delete: (id: string) => apiDelete(`/api/orders/${id}`),
  },

  // 合同
  contracts: {
    list: (params?: Record<string, string>) => apiGet('/api/contracts', params),
    get: (id: string) => apiGet(`/api/contracts/${id}`),
    create: (data: any) => apiPost('/api/contracts', data),
    update: (id: string, data: any) => apiPut(`/api/contracts/${id}`, data),
    delete: (id: string) => apiDelete(`/api/contracts/${id}`),
  },

  // 发票
  invoices: {
    list: (params?: Record<string, string>) => apiGet('/api/invoices', params),
    get: (id: string) => apiGet(`/api/invoices/${id}`),
    create: (data: any) => apiPost('/api/invoices', data),
    update: (id: string, data: any) => apiPut(`/api/invoices/${id}`, data),
    delete: (id: string) => apiDelete(`/api/invoices/${id}`),
  },

  // 通知
  notifications: {
    list: () => apiGet('/api/notifications'),
    markRead: (id: string) => apiPut(`/api/notifications/${id}`, { read: true }),
    markAllRead: () => apiPut('/api/notifications/read-all'),
  },

  // 消息
  messages: {
    list: () => apiGet('/api/messages'),
    send: (data: any) => apiPost('/api/messages/send', data),
  },

  // 文件上传
  upload: (file: File) => apiUpload('/api/upload', file),
}
