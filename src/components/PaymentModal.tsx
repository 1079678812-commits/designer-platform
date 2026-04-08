'use client'

import { useState } from 'react'
import { X, CreditCard, CheckCircle, Loader2 } from 'lucide-react'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  order: { id: string; orderNo: string; title: string; amount: number } | null
  onSuccess: () => void
}

export default function PaymentModal({ open, onClose, order, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<'wechat' | 'alipay' | 'bank'>('wechat')
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [step, setStep] = useState<'select' | 'paying' | 'success'>('select')

  if (!open || !order) return null

  const handleCreatePayment = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, method }),
      })
      const data = await res.json()
      if (res.ok) {
        setStep('paying')
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    setConfirming(true)
    try {
      const res = await fetch(`/api/payments/confirm/PAY${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, success: true }),
      })
      if (res.ok) {
        setStep('success')
        setTimeout(() => { onSuccess(); onClose(); setStep('select') }, 1500)
      }
    } catch {} finally {
      setConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#F0F0F0]">
          <h3 className="text-lg font-semibold text-[rgba(0,0,0,0.85)]">确认收款</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#F5F5F5] rounded-lg"><X className="w-5 h-5 text-[rgba(0,0,0,0.45)]" /></button>
        </div>

        <div className="p-6">
          {step === 'select' && (
            <>
              <div className="text-center mb-6">
                <p className="text-sm text-[rgba(0,0,0,0.45)]">订单：{order.orderNo}</p>
                <p className="font-medium text-[rgba(0,0,0,0.85)] mt-1">{order.title}</p>
                <p className="text-3xl font-bold text-[rgba(0,0,0,0.85)] mt-3">¥{order.amount.toLocaleString()}</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { key: 'wechat' as const, label: '微信支付', color: 'bg-[#07C160]' },
                  { key: 'alipay' as const, label: '支付宝', color: 'bg-[#00B578]' },
                  { key: 'bank' as const, label: '银行转账', color: 'bg-[#8C8C8C]' },
                ].map(m => (
                  <button key={m.key} onClick={() => setMethod(m.key)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${method === m.key ? 'border-[#00B578] bg-[#E8F8F0]/50' : 'border-[#E8E8E8] hover:border-[#D9D9D9]'}`}>
                    <div className={`w-8 h-8 ${m.color} rounded-lg flex items-center justify-center`}>
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[rgba(0,0,0,0.85)]">{m.label}</span>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 ${method === m.key ? 'border-[#00B578] bg-[#00B578]' : 'border-[#D9D9D9]'}`}>
                      {method === m.key && <CheckCircle className="w-5 h-5 text-white" />}
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={handleCreatePayment} disabled={loading}
                className="w-full py-3 bg-[#00B578] text-white rounded-lg font-medium hover:bg-[#009A63] disabled:opacity-50 transition-colors">
                {loading ? '创建支付...' : '确认收款'}
              </button>
              <p className="text-xs text-[rgba(0,0,0,0.25)] text-center mt-3">MVP阶段：点击确认后模拟支付成功</p>
            </>
          )}

          {step === 'paying' && (
            <div className="text-center py-8">
              <p className="text-sm text-[rgba(0,0,0,0.45)] mb-4">等待客户付款...</p>
              <p className="text-xs text-[rgba(0,0,0,0.25)] mb-6">MVP模式：点击下方按钮模拟付款成功</p>
              <button onClick={handleConfirmPayment} disabled={confirming}
                className="px-6 py-3 bg-[#52C41A] text-white rounded-lg font-medium hover:bg-[#389E0D] disabled:opacity-50 transition-colors">
                {confirming ? <><Loader2 className="w-4 h-4 inline animate-spin mr-2" />处理中...</> : '模拟付款成功'}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-[#52C41A] mx-auto mb-4" />
              <p className="text-lg font-semibold text-[rgba(0,0,0,0.85)]">收款成功！</p>
              <p className="text-sm text-[rgba(0,0,0,0.45)] mt-1">已自动创建发票</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
