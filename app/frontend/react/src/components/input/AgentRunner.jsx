import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Globe, ChevronDown, Zap, Cpu, Settings2 } from 'lucide-react'
import { cn } from '../../lib/utils'

const MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', sub: 'Versatile · Fast' },
  { id: 'llama-3.1-8b-instant',    label: 'Llama 3.1 8B',  sub: 'Instant · Lite'  },
]

function ModelDropdown({ model, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = MODELS.find(m => m.id === model) || MODELS[0]

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        id="model-selector"
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-raised border border-border hover:border-border-strong transition-colors text-xs"
      >
        <Cpu size={12} className="text-text-placeholder" />
        <span className="text-text-secondary font-medium">{current.label}</span>
        <ChevronDown size={10} className={cn('text-text-placeholder transition-transform duration-150', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1.5 w-52 bg-bg-raised border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {MODELS.map(m => (
              <button
                key={m.id}
                onClick={() => { onSelect(m.id); setOpen(false) }}
                id={`model-${m.id}`}
                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-bg-overlay transition-colors"
              >
                <div className={cn(
                  'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  model === m.id ? 'border-text-primary' : 'border-border-strong'
                )}>
                  {model === m.id && <span className="w-1 h-1 rounded-full bg-text-primary block" />}
                </div>
                <div>
                  <div className="text-xs text-text-primary font-medium">{m.label}</div>
                  <div className="text-2xs text-text-placeholder">{m.sub}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AgentRunner({
  onRun, isStreaming,
  model, onModelChange,
  allowSearch, onToggleSearch,
  systemPrompt, onSystemPromptChange,
}) {
  const [query, setQuery] = useState('')
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const textareaRef = useRef(null)

  const handleRun = useCallback(() => {
    const t = query.trim()
    if (!t || isStreaming) return
    onRun(t)
    setQuery('')
  }, [query, isStreaming, onRun])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRun() }
  }

  const canRun = query.trim().length > 0 && !isStreaming

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-xl"
    >
      {/* Title */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-8 h-8 rounded-xl bg-bg-surface border border-border flex items-center justify-center">
          <Zap size={14} className="text-text-muted" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-primary tracking-tight">Multi-AI Agent</h1>
          <p className="text-xs text-text-placeholder">Configure and run</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">

        {/* System prompt row */}
        <div className="px-5 py-4">
          <button
            onClick={() => setShowSystemPrompt(v => !v)}
            className="flex items-center justify-between w-full"
            id="system-prompt-toggle"
          >
            <div className="flex items-center gap-2">
              <Settings2 size={13} className="text-text-placeholder" />
              <span className="text-xs font-medium text-text-secondary">Describe your agent</span>
            </div>
            <ChevronDown size={12} className={cn('text-text-placeholder transition-transform duration-200', showSystemPrompt && 'rotate-180')} />
          </button>

          <AnimatePresence initial={false}>
            {showSystemPrompt && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <textarea
                  value={systemPrompt}
                  onChange={e => onSystemPromptChange(e.target.value)}
                  rows={3}
                  placeholder="e.g. You are a research assistant who cites sources and thinks step by step…"
                  id="system-prompt-input"
                  className="w-full mt-3 bg-bg-raised border border-border rounded-xl px-4 py-3 text-sm text-text-secondary placeholder:text-text-placeholder resize-none outline-none focus:border-border-strong transition-colors leading-relaxed"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Model + Search row */}
        <div className="flex items-center gap-2 px-5 py-3.5">
          <ModelDropdown model={model} onSelect={onModelChange} />

          <button
            onClick={onToggleSearch}
            id="search-toggle"
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all',
              allowSearch
                ? 'bg-bg-raised border-border-strong text-text-secondary'
                : 'border-border text-text-placeholder hover:text-text-muted hover:bg-bg-raised hover:border-border-strong'
            )}
          >
            <Globe size={12} />
            <span>Web Search</span>
            <span className={cn('w-1.5 h-1.5 rounded-full transition-colors', allowSearch ? 'bg-emerald-500' : 'bg-border-strong')} />
          </button>
        </div>

        {/* Query input */}
        <div className="px-5 py-4">
          <label className="text-2xs text-text-placeholder uppercase tracking-widest font-medium block mb-2.5">
            Query
          </label>
          <div className={cn(
            'rounded-xl border bg-bg-raised transition-colors',
            query.trim() ? 'border-border-strong' : 'border-border focus-within:border-border-strong'
          )}>
            <textarea
              ref={textareaRef}
              id="query-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything…"
              rows={4}
              className="w-full bg-transparent resize-none px-4 pt-3.5 pb-2 text-sm text-text-primary placeholder:text-text-placeholder outline-none border-none leading-relaxed block"
              aria-label="Query"
              style={{ minHeight: '100px' }}
            />
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <span className="text-2xs text-text-placeholder">
                <kbd className="bg-bg-overlay border border-border px-1 py-0.5 rounded font-mono">↵</kbd> run
                &nbsp;·&nbsp;
                <kbd className="bg-bg-overlay border border-border px-1 py-0.5 rounded font-mono">⇧↵</kbd> new line
              </span>
              <button
                onClick={handleRun}
                disabled={!canRun}
                id="run-btn"
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all',
                  canRun
                    ? 'bg-text-primary text-bg-base hover:opacity-90 cursor-pointer'
                    : 'bg-bg-overlay text-text-placeholder cursor-not-allowed'
                )}
              >
                <ArrowUp size={13} strokeWidth={2.5} />
                Run Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
