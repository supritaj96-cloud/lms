import { useState } from 'react'
import { request } from '../../lib/api'

const welcomeMessage = { role: 'assistant', text: "Hi! I'm SkillBridge AI 👋 I can help you explore courses, instructors, pricing, and course content. What would you like to know?" }

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([welcomeMessage])
  const [isSending, setIsSending] = useState(false)

  const sendMessage = async (event) => {
    event.preventDefault()
    const text = message.trim()
    if (!text || isSending) return
    setMessages((items) => [...items, { role: 'user', text }])
    setMessage('')
    setIsSending(true)
    try {
      const history = messages
        .filter((item, index) => index > 0)
        .slice(-10)
        .map(({ role, text: historyText }) => ({ role, text: historyText }))
      const data = await request('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, history }) })
      setMessages((items) => [...items, { role: 'assistant', text: data.reply }])
    } catch (error) {
      setMessages((items) => [...items, { role: 'assistant', text: error.message || 'Something went wrong. Please try again.' }])
    } finally { setIsSending(false) }
  }

  return <div className='fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3'>
    {isOpen && <section className='flex h-[min(580px,calc(100vh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20'>
      <header className='flex items-center justify-between bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-4 text-white'><div><p className='font-semibold'>SkillBridge AI</p><p className='text-xs text-blue-100'>Course learning assistant</p></div><div className='flex gap-2'><button onClick={() => setMessages([welcomeMessage])} className='rounded-lg px-2 py-1 text-xs hover:bg-white/15'>Clear</button><button onClick={() => setIsOpen(false)} className='rounded-lg px-2 py-1 text-lg leading-none hover:bg-white/15' aria-label='Close assistant'>×</button></div></header>
      <div className='flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4'>{messages.map((item, index) => <div key={`${item.role}-${index}`} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === 'user' ? 'ml-auto rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md bg-white text-slate-700 shadow-sm ring-1 ring-slate-100'}`}>{item.text}</div>)}{isSending && <div className='w-fit rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-slate-500 shadow-sm'>SkillBridge AI is thinking…</div>}</div>
      <form onSubmit={sendMessage} className='flex gap-2 border-t border-slate-200 bg-white p-3'><input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={800} placeholder='Ask about courses…' className='min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100' /><button disabled={isSending || !message.trim()} className='rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'>Send</button></form>
    </section>}
    <button onClick={() => setIsOpen((value) => !value)} className='grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-2xl text-white shadow-xl shadow-blue-500/35 transition hover:scale-105' aria-label='Open SkillBridge AI'>✦</button>
  </div>
}

export default ChatWidget
