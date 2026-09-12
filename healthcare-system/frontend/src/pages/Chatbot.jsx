/**
 * pages/Chatbot.jsx
 * AI Symptom Checker — Claude powered.
 */

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSend, FiMessageSquare, FiAlertTriangle,
  FiCheckCircle, FiXCircle, FiHome, FiUser, FiRefreshCw,
} from 'react-icons/fi'
import api from '../services/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_SYMPTOMS = [
  'Chest pain aur breathlessness',
  'Headache and fever',
  'Stomach pain and acidity',
  'Joint pain and swelling',
  'Skin rash and itching',
  'Anxiety and stress',
  'Eye redness and pain',
  'Cough and cold',
  'Back pain',
  'Diabetes checkup',
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Chatbot() {
  const [messages, setMessages] = useState([{ type: 'welcome' }])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [history, setHistory]   = useState([])
  const bottomRef               = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (overrideText) => {
    const text = (overrideText || input).trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { type: 'user', text }])
    setInput('')
    setLoading(true)

    const newHistory = [...history, { role: 'user', content: text }]

    try {
      const res = await api.post('/chatbot/symptom-check/', {
        symptoms: text,
        history:  history,
      })

      const aiText = JSON.stringify(res.data.ai_response || {})
      setHistory([...newHistory, { role: 'assistant', content: aiText }])
      setMessages((prev) => [...prev, { type: 'bot', data: res.data }])
    } catch {
      setHistory(newHistory)
      setMessages((prev) => [
        ...prev,
        { type: 'error', text: 'Sorry, kuch problem aayi. Thodi der baad try karein.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const resetChat = () => {
    setMessages([{ type: 'welcome' }])
    setHistory([])
    setInput('')
  }

  const isFirstMessage = messages.length === 1

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiMessageSquare className="text-primary-600" /> MediBot AI
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Powered by Claude — Smart health assistant
          </p>
        </div>
        <button
          onClick={resetChat}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
                     px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 transition"
        >
          <FiRefreshCw size={13} /> New Chat
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-5 mb-3 pr-1">
        {messages.map((msg, i) => {
          if (msg.type === 'welcome') return <WelcomeMessage key={i} />
          if (msg.type === 'user')    return <UserBubble key={i} text={msg.text} />
          if (msg.type === 'error')   return <ErrorBubble key={i} text={msg.text} />
          if (msg.type === 'bot')     return <BotResponse key={i} data={msg.data} />
          return null
        })}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Quick symptom chips — only on first message */}
      {isFirstMessage && (
        <div className="flex gap-2 flex-wrap mb-3">
          {QUICK_SYMPTOMS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600
                         text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:border-primary-300
                         hover:text-primary-700 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2 items-end">
        <textarea
          rows={2}
          className="input-field flex-1 resize-none text-sm"
          placeholder="Apne symptoms describe karein... (Hindi ya English mein)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="btn-primary p-3 rounded-xl disabled:opacity-50"
        >
          <FiSend size={18} />
        </button>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center
                    text-white text-xs font-bold flex-shrink-0 mt-1">
      AI
    </div>
  )
}

function WelcomeMessage() {
  return (
    <div className="flex gap-3">
      <BotAvatar />
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                      rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm max-w-[88%]">
        <p className="text-sm font-semibold text-primary-700 dark:text-primary-400 mb-1">
          Namaste! Main MediBot hoon
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          Aapke symptoms describe karein aur main aapko:
        </p>
        <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
          {[
            'Medical assessment dunga',
            'OTC medicines suggest karunga',
            'Ghar ke nuskhe bataunga',
            'Sahi doctor se milwaunga',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <FiCheckCircle size={13} className="text-green-500 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
          <FiAlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
          Emergency mein seedha 108 call karein. Yeh advice sirf guidance ke liye hai.
        </p>
      </div>
    </div>
  )
}

function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-3
                      max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    </div>
  )
}

function ErrorBubble({ text }) {
  return (
    <div className="flex gap-3">
      <BotAvatar />
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                      rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-red-700 dark:text-red-400">
        {text}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <BotAvatar />
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                      rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Analyzing symptoms</span>
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Bot Response Card ────────────────────────────────────────────────────────

function BotResponse({ data }) {
  const ai      = data.ai_response || {}
  const doctors = data.suggested_doctors || []
  const [tab, setTab] = useState('overview')

  const tabs = [
    { id: 'overview',  label: 'Assessment' },
    { id: 'medicines', label: `Medicines (${(ai.medicines || []).length})` },
    { id: 'remedies',  label: 'Home Remedies' },
    { id: 'doctors',   label: `Doctors (${doctors.length})` },
  ]

  return (
    <div className="flex gap-3">
      <BotAvatar />
      <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                      rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">

        {/* Emergency warning */}
        {!!ai.emergency_warning && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20
                          border-b border-red-200 dark:border-red-800 px-4 py-3">
            <FiAlertTriangle size={15} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">
              {ai.emergency_warning}
            </p>
          </div>
        )}

        {/* Greeting + conditions */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{ai.greeting}</p>
          {(ai.possible_conditions || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ai.possible_conditions.map((c) => (
                <span key={c}
                  className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20
                             text-blue-700 dark:text-blue-400 rounded-full
                             border border-blue-200 dark:border-blue-800">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-4 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-xs font-medium px-3 py-2 border-b-2 transition whitespace-nowrap ${
                tab === t.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-4 py-4">

          {/* Assessment */}
          {tab === 'overview' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {ai.assessment}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(ai.do_list || []).length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                      <FiCheckCircle size={12} /> Kya karein
                    </p>
                    <ul className="space-y-1">
                      {ai.do_list.map((item, i) => (
                        <li key={i} className="text-xs text-green-800 dark:text-green-300 leading-relaxed">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(ai.dont_list || []).length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3">
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                      <FiXCircle size={12} /> Kya na karein
                    </p>
                    <ul className="space-y-1">
                      {ai.dont_list.map((item, i) => (
                        <li key={i} className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {!!ai.follow_up_advice && (
                <div className="flex items-start gap-2 text-xs bg-amber-50 dark:bg-amber-900/10
                                rounded-xl p-3 text-amber-700 dark:text-amber-400">
                  <FiAlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                  <span>{ai.follow_up_advice}</span>
                </div>
              )}
            </div>
          )}

          {/* Medicines */}
          {tab === 'medicines' && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs bg-amber-50 dark:bg-amber-900/10
                              rounded-xl p-3 text-amber-700 dark:text-amber-400">
                <FiAlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                <span>
                  Yeh medicines sirf temporary relief ke liye hain.
                  Doctor ki salah liye bina koi bhi medicine lena avoid karein.
                </span>
              </div>
              {(ai.medicines || []).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Doctor se milne ke baad medicine leni chahiye.
                </p>
              ) : (
                ai.medicines.map((med, i) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{med.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{med.type} &bull; {med.purpose}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20
                                       text-blue-700 dark:text-blue-400 rounded-full flex-shrink-0">
                        OTC
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Dosage</p>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">{med.dosage}</p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-2">
                        <p className="text-xs text-orange-500">Precaution</p>
                        <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mt-0.5">{med.note}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Home Remedies */}
          {tab === 'remedies' && (
            <div className="space-y-2">
              {(ai.home_remedies || []).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Koi ghar ka nuskha nahi mila.</p>
              ) : (
                ai.home_remedies.map((remedy, i) => (
                  <div key={i}
                    className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10
                               rounded-xl border border-green-100 dark:border-green-900/30">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center
                                    text-white text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">{remedy}</p>
                  </div>
                ))
              )}
              <div className="flex items-start gap-2 text-xs bg-blue-50 dark:bg-blue-900/10
                              rounded-xl p-3 text-blue-700 dark:text-blue-400 mt-2">
                <FiHome size={12} className="flex-shrink-0 mt-0.5" />
                <span>
                  Ghar ke nuskhe thodi rahat denge. Problem bani rahe to doctor se zaroor milein.
                </span>
              </div>
            </div>
          )}

          {/* Doctors */}
          {tab === 'doctors' && (
            <div className="space-y-2">
              {doctors.length === 0 ? (
                <div className="text-center py-6">
                  <FiUser size={28} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500">
                    Is specialization mein abhi koi doctor available nahi hai.
                  </p>
                  <Link
                    to="/patient/book"
                    className="text-sm text-primary-600 hover:underline mt-1 inline-block"
                  >
                    Sab doctors dekhein &rarr;
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-2">
                    Suggested: <strong>{(data.specializations || []).join(', ')}</strong>
                  </p>
                  {doctors.map((doc) => (
                    <Link
                      key={doc.id}
                      to="/patient/book"
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700
                                 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl
                                 border border-gray-200 dark:border-gray-600 hover:border-primary-300
                                 transition group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex
                                      items-center justify-center font-bold text-primary-700
                                      dark:text-primary-400 text-sm flex-shrink-0">
                        {(doc.name || '').split(' ')[1]?.[0]}
                        {(doc.name || '').split(' ')[2]?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {doc.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {doc.specialization} &bull; {doc.experience_years}y exp
                        </p>
                        <p className="text-xs text-gray-400">{doc.department}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-primary-600">&#8377;{doc.consultation_fee}</p>
                        <p className="text-xs text-gray-400 group-hover:text-primary-600 transition">
                          Book &rarr;
                        </p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to="/patient/book"
                    className="flex items-center justify-center gap-1 w-full text-sm text-primary-600
                               hover:text-primary-700 font-medium py-2 mt-1 border border-primary-200
                               dark:border-primary-800 rounded-xl hover:bg-primary-50 transition"
                  >
                    Appointment Book Karein &rarr;
                  </Link>
                </>
              )}
            </div>
          )}

        </div>

        {/* Disclaimer */}
        <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700 pt-2">
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
            {data.disclaimer}
          </p>
        </div>
      </div>
    </div>
  )
}