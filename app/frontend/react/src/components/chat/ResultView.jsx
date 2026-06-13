import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, Check, Globe, CheckCircle2, Search, AlertCircle, Square, RotateCcw, ExternalLink } from 'lucide-react'
import { cn, extractDomain } from '../../lib/utils'

// ─── Code block with copy ─────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }
  return (
    <button onClick={copy}
      className="absolute top-3 right-3 p-1.5 rounded-lg bg-bg-raised border border-border text-text-placeholder hover:text-text-muted transition-all opacity-0 group-hover:opacity-100">
      {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
    </button>
  )
}

function CodeBlock({ children, className }) {
  const code = String(children).replace(/\n$/, '')
  const lang = className?.replace('language-', '') || 'code'
  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-border">
      <div className="flex items-center px-4 py-2 bg-bg-base border-b border-border">
        <span className="text-2xs text-text-placeholder font-mono uppercase tracking-widest">{lang}</span>
      </div>
      <div className="relative bg-bg-surface">
        <pre className="overflow-x-auto p-4 m-0"><code className={className}>{code}</code></pre>
        <CopyButton text={code} />
      </div>
    </div>
  )
}

const mdComponents = {
  pre: ({ children }) => <>{children}</>,
  code({ inline, className, children }) {
    if (inline) return <code className={className}>{children}</code>
    return <CodeBlock className={className}>{children}</CodeBlock>
  },
}

// ─── Agent steps trace ────────────────────────────────────────────
function AgentTrace({ steps }) {
  if (!steps || steps.length === 0) return null
  return (
    <div className="mb-5 space-y-0">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-start gap-3 relative"
        >
          {i < steps.length - 1 && (
            <span className="absolute left-[7px] top-4 bottom-0 w-px bg-gradient-to-b from-border to-transparent" />
          )}
          <div className="relative z-10 mt-0.5 flex-shrink-0">
            {step.done ? (
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                <CheckCircle2 size={15} className="text-text-placeholder" />
              </motion.div>
            ) : (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}>
                <Search size={15} className="text-text-placeholder" />
              </motion.div>
            )}
          </div>
          <p className={cn('pb-3 text-sm', step.done ? 'text-text-placeholder' : 'text-text-muted')}>{step.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Source cards ─────────────────────────────────────────────────
function SourceCard({ source, index }) {
  const domain = extractDomain(source.url || '')
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  return (
    <motion.a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex flex-col gap-2 p-3 rounded-xl border border-border bg-bg-surface hover:bg-bg-raised hover:border-border-strong transition-all no-underline min-w-[180px] max-w-[210px] flex-shrink-0"
      id={`source-${index}`}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded flex items-center justify-center bg-bg-raised flex-shrink-0 overflow-hidden">
          <img src={faviconUrl} alt="" className="w-3.5 h-3.5" onError={e => e.target.style.display = 'none'} />
        </div>
        <span className="text-2xs text-text-placeholder truncate flex-1">{domain}</span>
        <ExternalLink size={10} className="text-text-placeholder opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
      <p className="text-2xs text-text-muted line-clamp-2 leading-relaxed">{domain}</p>
      <span className="text-2xs text-text-placeholder font-mono bg-bg-raised px-1.5 py-0.5 rounded w-fit">{index + 1}</span>
    </motion.a>
  )
}

function SourcesPanel({ sources }) {
  if (!sources?.length) return null
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Globe size={13} className="text-text-placeholder" />
        <span className="text-xs text-text-placeholder font-medium uppercase tracking-wider">
          {sources.length} {sources.length === 1 ? 'source' : 'sources'}
        </span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1">
        {sources.map((s, i) => <SourceCard key={i} source={s} index={i} />)}
      </div>
    </div>
  )
}

// ─── Result view (full page) ──────────────────────────────────────
export function ResultView({ messages, agentSteps, isSearching, isStreaming, onStop, onNewRun }) {
  // Find the user query and assistant response
  const userMsg = messages.find(m => m.role === 'user')
  const assistantMsg = messages.find(m => m.role === 'assistant')

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 pb-16">

      {/* Query heading */}
      {userMsg && (
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-[1.75rem] font-semibold tracking-tight leading-snug text-text-primary mb-8"
        >
          {userMsg.content}
        </motion.h2>
      )}

      {/* Agent trace */}
      <AgentTrace steps={agentSteps} />

      {/* Sources */}
      {assistantMsg?.sources?.length > 0 && (
        <SourcesPanel sources={assistantMsg.sources} />
      )}

      {/* Answer section */}
      {(assistantMsg?.sources?.length > 0 || agentSteps.length > 0) && (
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs text-text-placeholder font-medium uppercase tracking-widest">Answer</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {/* Content */}
      {assistantMsg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          {assistantMsg.isError ? (
            <div className="flex items-start gap-3 text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded-xl p-4">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
              <span>{assistantMsg.content || 'Something went wrong. Please try again.'}</span>
            </div>
          ) : assistantMsg.content ? (
            <div className={cn('prose prose-invert', assistantMsg.isStreaming && 'streaming-cursor')}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={mdComponents}>
                {assistantMsg.content}
              </ReactMarkdown>
            </div>
          ) : assistantMsg.isStreaming ? (
            // Dots while waiting for first token
            <div className="flex items-center gap-1.5 h-8">
              {[0, 1, 2].map(i => (
                <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-text-placeholder"
                  animate={{ y: [-2, 2, -2], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          ) : null}
        </motion.div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-3 mt-10 pt-6 border-t border-border">
        {isStreaming ? (
          <button onClick={onStop} id="stop-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs text-text-muted border border-border hover:border-border-strong hover:text-text-secondary transition-all">
            <Square size={11} />
            Stop
          </button>
        ) : (
          <button onClick={onNewRun} id="new-run-bottom-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs text-text-secondary bg-bg-surface border border-border hover:border-border-strong hover:bg-bg-raised transition-all">
            <RotateCcw size={12} />
            New run
          </button>
        )}
      </div>
    </div>
  )
}
