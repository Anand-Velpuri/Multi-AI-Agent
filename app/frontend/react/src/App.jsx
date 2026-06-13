import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from './hooks/useChat'
import { v4 as uuidv4 } from 'uuid'
import { Zap, RotateCcw } from 'lucide-react'
import { AgentRunner } from './components/input/AgentRunner'
import { ResultView } from './components/chat/ResultView'

const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful, accurate, and concise AI assistant. When searching the web, always cite your sources.'

export default function App() {
  const [model, setModel] = useState('llama-3.3-70b-versatile')
  const [allowSearch, setAllowSearch] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [sessionId, setSessionId] = useState(() => uuidv4())

  const {
    getMessages, sendMessage, stopStreaming, clearMessages,
    isStreaming, isSearching, searchStatus, agentStepsByConv,
  } = useChat({
    activeConversation: { id: sessionId, checkpointerId: sessionId, messageCount: 0 },
    updateConversation: () => {},
    model,
    systemPrompt,
  })

  const messages = getMessages(sessionId)
  const hasMessages = messages.length > 0

  const handleRun = useCallback(async (content) => {
    await sendMessage({
      content,
      convId: sessionId,
      checkpointerId: sessionId,
      allowSearch,
      onFirstMessage: null,
    })
  }, [sessionId, sendMessage, allowSearch])

  function handleNewRun() {
    clearMessages(sessionId)
    // Fresh session ID for a clean checkpointer
    setSessionId(uuidv4())
  }

  const agentSteps = agentStepsByConv[sessionId] || []

  return (
    <div style={{ height: '100dvh' }} className="flex flex-col bg-bg-base overflow-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-bg-surface border border-border flex items-center justify-center">
            <Zap size={12} className="text-text-muted" />
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">Multi-AI Agent</span>
        </div>

        <AnimatePresence>
          {hasMessages && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleNewRun}
              id="new-run-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-text-placeholder hover:text-text-muted hover:bg-bg-surface border border-transparent hover:border-border transition-all"
            >
              <RotateCcw size={12} />
              New run
            </motion.button>
          )}
        </AnimatePresence>
      </header>

      {/* Main */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>

          {!hasMessages ? (
            <motion.div
              key="runner"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0 flex items-center justify-center overflow-y-auto p-6"
            >
              <AgentRunner
                onRun={handleRun}
                isStreaming={isStreaming}
                model={model}
                onModelChange={setModel}
                allowSearch={allowSearch}
                onToggleSearch={() => setAllowSearch(v => !v)}
                systemPrompt={systemPrompt}
                onSystemPromptChange={setSystemPrompt}
              />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <ResultView
                messages={messages}
                agentSteps={agentSteps}
                isSearching={isSearching}
                isStreaming={isStreaming}
                onStop={stopStreaming}
                onNewRun={handleNewRun}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
