'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'
import { Search, Plus, Receipt, Edit, X, Upload, Download, Eye, Trash2 } from 'lucide-react'
import PDFThumbnail from '@/components/PDFThumbnail'
import PDFIcon from '@/components/PDFIcon'

interface Invoice { id: string; invoiceNo: string; title: string; amount: number; status: string; fileUrl?: string; dueDate: string | null; createdAt: string; order?: { title: string } }

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: '待支付', color: 'text-[#FAAD14] bg-[#FFFBE6] border border-[#FFE58F]' },
  paid: { label: '已支付', color: 'text-[#52C41A] bg-[#F6FFED] border border-[#B7EB8F]' },
  overdue: { label: '已逾期', color: 'text-[#FF4D4F] bg-[#FFF2F0] border border-[#FFCCC7]' },
  cancelled: { label: '已取消', color: 'text-[rgba(0,0,0,0.45)] bg-[#F5F5F5] border border-[#E8E8E8]' },
}

export default function InvoicesPage() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const prefillOrderId = searchParams.get('orderId')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [orders, setOrders] = useState<{id:string,title:string,status:string}[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ orderId: '', status: 'pending', fileUrl: '' })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pdfUploading, setPdfUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (user) { fetchInvoices(); fetchOrders().then(() => { if (prefillOrderId) { setForm({ orderId: prefillOrderId, status: 'pending', fileUrl: '' }); setEditingId(null); setShowModal(true) } }) } }, [user])

  const fetchInvoices = async () => {
    try { const res = await fetch('/api/invoices'); if (res.ok) { const data = await res.json(); setInvoices(Array.isArray(data) ? data : data.invoices || []) } } catch {} finally { setLoading(false) }
  }
  const fetchOrders = async () => {
    try { const res = await fetch('/api/orders'); if (res.ok) { const data = await res.json(); setOrders(Array.isArray(data) ? data : data.orders || []); return data } } catch { return [] }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') return alert('请上传 PDF 文件')
    setPdfUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', 'invoice')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        setForm(f => ({ ...f, fileUrl: data.file.url }))
      } else { alert('上传失败') }
    } catch { alert('上传失败') }
    finally { setPdfUploading(false); if (pdfInputRef.current) pdfInputRef.current.value = '' }
  }

  const handleCreate = async () => {
    if (!form.orderId) return alert('请选择关联订单')
    setSubmitting(true)
    try {
      const matchedOrder = orders.find(o => o.id === form.orderId)
      const orderTitle = matchedOrder?.title || '发票'
      const orderAmount = (matchedOrder as any)?.amount || 0
      const body: any = { title: orderTitle, amount: orderAmount, orderId: form.orderId }
      if (form.fileUrl) body.fileUrl = form.fileUrl
      if (editingId) { body.status = form.status; if (form.status === 'paid') body.paidAt = new Date().toISOString(); if (form.status !== 'paid') body.paidAt = null }
      const url = editingId ? `/api/invoices/${editingId}` : '/api/invoices'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { setShowModal(false); setForm({ orderId: '', status: 'pending', fileUrl: '' }); setEditingId(null); fetchInvoices() }
      else { const data = await res.json(); alert(data.error || '操作失败') }
    } catch { alert('网络错误') } finally { setSubmitting(false) }
  }

  const handleEdit = (invoice: Invoice) => {
    setEditingId(invoice.id)
    setForm({ orderId: (invoice as any).orderId || '', status: invoice.status, fileUrl: (invoice as any).fileUrl || '' })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此发票吗？')) return
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      if (res.ok) setInvoices(prev => prev.filter(i => i.id !== id))
      else alert('删除失败')
    } catch { alert('删除失败') }
  }

  const filtered = invoices.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.invoiceNo.toLowerCase().includes(search.toLowerCase()) || (i.order?.title || '').toLowerCase().includes(search.toLowerCase()))

  if (authLoading || loading) return (<div className="flex min-h-screen bg-[#F5F5F5]"><Sidebar /><div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-[#00B578] border-t-transparent rounded-full animate-spin" /></div></div>)

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div><h1 className="text-xl md:text-2xl font-bold text-[rgba(0,0,0,0.85)]">发票管理</h1><p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">管理你的发票和账单</p></div>
            <button onClick={() => { setEditingId(null); setForm({ orderId: '', status: 'pending', fileUrl: '' }); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2.5 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] transition-colors text-sm"><Plus className="w-4 h-4" /> 新建发票</button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E8E8] mb-6">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(0,0,0,0.45)]" /><input type="text" placeholder="搜索发票..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm" /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(invoice => {
            const config = statusConfig[invoice.status] || statusConfig.pending
            const fileUrl = (invoice as any).fileUrl
            return (
              <div key={invoice.id} className="bg-white rounded-xl border border-[#E8E8E8] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {fileUrl ? (
                      <PDFThumbnail url={fileUrl} name={invoice.order?.title} size="md" onClick={() => setPreviewUrl(fileUrl)} />
                    ) : (
                      <PDFThumbnail size="md" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1"><span className="text-xs text-[rgba(0,0,0,0.45)]">#{invoice.invoiceNo}</span></div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-[rgba(0,0,0,0.85)]">{invoice.order?.title || invoice.title}</h3>
                      {fileUrl && (
                        <>
                          <button onClick={() => setPreviewUrl(fileUrl)} className="p-1 hover:bg-[#F5F5F5] rounded text-[rgba(0,0,0,0.35)] hover:text-[rgba(0,0,0,0.65)]" title="预览PDF"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => window.open(fileUrl, '_blank')} className="p-1 hover:bg-[#F5F5F5] rounded text-[rgba(0,0,0,0.35)] hover:text-[rgba(0,0,0,0.65)]" title="下载PDF"><Download className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => handleEdit(invoice)} className="p-1.5 hover:bg-[#F5F5F5] rounded-lg text-[rgba(0,0,0,0.45)]"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(invoice.id)} className="p-1.5 hover:bg-[#FFF2F0] rounded-lg text-[#FF4D4F]"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <select
                      value={invoice.status}
                      onChange={async e => {
                        const newStatus = e.target.value
                        const payload: any = { status: newStatus }
                        if (newStatus === 'paid') payload.paidAt = new Date().toISOString()
                        if (newStatus !== 'paid') payload.paidAt = null
                        await fetch(`/api/invoices/${invoice.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                        setInvoices(prev => prev.map(i => i.id === invoice.id ? {...i, status: newStatus, paidAt: newStatus === 'paid' ? new Date().toISOString() : null} : i))
                      }}
                      className="text-xs px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#00B578] appearance-none text-center"
                      style={{ backgroundColor: invoice.status === 'pending' ? '#FFFBE6' : invoice.status === 'paid' ? '#F6FFED' : invoice.status === 'overdue' ? '#FFF2F0' : '#F5F5F5', color: invoice.status === 'pending' ? '#FAAD14' : invoice.status === 'paid' ? '#52C41A' : invoice.status === 'overdue' ? '#FF4D4F' : 'rgba(0,0,0,0.45)' }}
                    >
                      <option value="pending">待支付</option>
                      <option value="paid">已支付</option>
                      <option value="overdue">已逾期</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && (<div className="text-center py-12"><Receipt className="w-12 h-12 text-[rgba(0,0,0,0.15)] mx-auto mb-4" /><h3 className="text-base font-medium">暂无发票</h3></div>)}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5"><h2 className="text-lg font-bold">{editingId ? '编辑发票' : '新建发票'}</h2><button onClick={() => { setShowModal(false); setEditingId(null) }} className="p-1 hover:bg-[#F5F5F5] rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">关联订单 *</label><select value={form.orderId} onChange={e => setForm({...form, orderId: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm"><option value="">选择订单</option>{orders.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}</select></div>

              {/* PDF upload */}
              <div>
                <label className="block text-sm font-medium mb-2">发票扫描件</label>
                <div className="flex items-center gap-3">
                  {form.fileUrl ? (
                    <div className="relative">
                      <PDFThumbnail url={form.fileUrl} size="md" onClick={() => window.open(form.fileUrl, '_blank')} />
                      <button onClick={() => setForm(f => ({...f, fileUrl: ''}))} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF4D4F] text-white rounded-full flex items-center justify-center shadow-sm hover:bg-[#CF1322]"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button onClick={() => pdfInputRef.current?.click()} disabled={pdfUploading} className="w-12 h-16 border-2 border-dashed border-[#D9D9D9] rounded-lg flex flex-col items-center justify-center gap-0.5 text-[rgba(0,0,0,0.25)] hover:border-[#00B578] hover:text-[#00B578] transition-colors disabled:opacity-50">
                      {pdfUploading ? <div className="w-4 h-4 border-2 border-[#00B578] border-t-transparent rounded-full animate-spin" /> : <><Upload className="w-4 h-4" /><span className="text-[8px] font-bold">PDF</span></>}
                    </button>
                  )}
                  <div className="flex flex-col gap-1">
                    <button onClick={() => pdfInputRef.current?.click()} disabled={pdfUploading} className="text-sm text-[#00B578] hover:text-[#009A63] disabled:opacity-50">
                      {pdfUploading ? '上传中...' : form.fileUrl ? '更换文件' : '上传 PDF'}
                    </button>
                    <span className="text-xs text-[rgba(0,0,0,0.25)]">支持 PDF 格式，自动压缩</span>
                  </div>
                  <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                </div>
              </div>

              <div><label className="block text-sm font-medium mb-1">状态</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#00B578] text-sm"><option value="pending">待支付</option><option value="paid">已支付</option><option value="overdue">已逾期</option><option value="cancelled">已取消</option></select></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => { setShowModal(false); setEditingId(null) }} className="px-4 py-2.5 border border-[#D9D9D9] rounded-lg text-sm hover:bg-[#F5F5F5]">取消</button><button onClick={handleCreate} disabled={submitting} className="px-4 py-2.5 bg-[#00B578] text-white rounded-lg text-sm hover:bg-[#009A63] disabled:opacity-50">{submitting ? '提交中...' : editingId ? '保存' : '创建'}</button></div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#F0F0F0]">
              <h3 className="font-semibold text-[rgba(0,0,0,0.85)]">发票预览</h3>
              <button onClick={() => setPreviewUrl(null)} className="p-1 hover:bg-[#F5F5F5] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 bg-[#525659]">
              <iframe src={previewUrl} className="w-full h-full border-0" title="PDF Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
