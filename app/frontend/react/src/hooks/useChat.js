import { useState, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

const SYSTEM_PROMPT_DEFAULT =
  'You are a helpful, accurate, and concise AI assistant. When searching the web, always cite your sources.'

export function useChat({ activeConversation, updateConversation, model, systemPrompt }) {
  const [messagesByConv, setMessagesByConv] = useState({})
  const [isStreaming, setIsStreaming] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchStatus, setSearchStatus] = useState('')
  const [agentStepsByConv, setAgentStepsByConv] = useState({})
  const abortRef = useRef(null)

  const addAgentStep = useCallback((convId, step) => {
    setAgentStepsByConv(prev => ({
      ...prev,
      [convId]: [...(prev[convId] || []), step],
    }))
  }, [])

  const updateLastAgentStep = useCallback((convId, updater) => {
    setAgentStepsByConv(prev => {
      const steps = [...(prev[convId] || [])]
      if (steps.length > 0) steps[steps.length - 1] = { ...steps[steps.length - 1], ...updater }
      return { ...prev, [convId]: steps }
    })
  }, [])

  const getMessages = useCallback(
    (convId) => (convId ? (messagesByConv[convId] || []) : []),
    [messagesByConv]
  )

  const setMessages = useCallback((convId, updater) => {
    setMessagesByConv(prev => ({
      ...prev,
      [convId]: typeof updater === 'function' ? updater(prev[convId] || []) : updater,
    }))
  }, [])

  const addMessage = useCallback((convId, message) => {
    setMessages(convId, prev => [...prev, message])
  }, [setMessages])

  const updateLastAssistantMessage = useCallback((convId, updater) => {
    setMessages(convId, prev => {
      const msgs = [...prev]
      const lastIdx = msgs.length - 1
      if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
        msgs[lastIdx] = { ...msgs[lastIdx], ...updater(msgs[lastIdx]) }
      }
      return msgs
    })
  }, [setMessages])

  const sendMessage = useCallback(async ({
    content,
    convId,
    checkpointerId,
    allowSearch,
    onFirstMessage,
  }) => {
    if (!content.trim() || isStreaming) return

    // User message
    const userMsg = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }
    addMessage(convId, userMsg)

    // Placeholder assistant message
    const assistantMsg = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      sources: [],
      isStreaming: true,
      timestamp: new Date().toISOString(),
    }
    addMessage(convId, assistantMsg)
    setIsStreaming(true)
    setIsSearching(false)
    setSearchStatus('')
    // Clear agent steps for this conv
    setAgentStepsByConv(prev => ({ ...prev, [convId]: [] }))

    // Notify parent to create/update conversation title
    if (onFirstMessage) onFirstMessage(content.trim())

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch('/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model_name: model,
          system_prompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
          messages: [content.trim()],
          allow_search: allowSearch,
          checkpointer_id: checkpointerId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw || raw === '[DONE]') continue

          let parsed
          try {
            parsed = JSON.parse(raw)
          } catch {
            continue
          }

          // Backend sends flat JSON: { type, content?, urls?, query?, ... }
          const { type } = parsed

          if (type === 'checkpoint') {
            if (parsed.checkpointer_id) {
              updateConversation?.(convId, { checkpointerId: parsed.checkpointer_id })
            }
          } else if (type === 'content') {
            updateLastAssistantMessage(convId, msg => ({
              content: msg.content + (parsed.content || ''),
            }))
          } else if (type === 'search_start') {
            setIsSearching(true)
            const label = parsed.query ? `Searching for "${parsed.query}"` : 'Searching the web'
            setSearchStatus(label + '…')
            addAgentStep(convId, { type: 'search_start', label, done: false })
          } else if (type === 'search_results') {
            setIsSearching(false)
            setSearchStatus('')
            // Mark last step as done
            updateLastAgentStep(convId, { done: true, label: `Found ${Array.isArray(parsed.urls) ? parsed.urls.length : 0} sources` })
            // Convert url strings to source objects
            const rawUrls = Array.isArray(parsed.urls) ? parsed.urls : []
            const sources = rawUrls.map(url => ({ url, title: url }))
            updateLastAssistantMessage(convId, msg => ({
              sources: [...(msg.sources || []), ...sources],
            }))
          } else if (type === 'end') {
            updateLastAssistantMessage(convId, msg => ({ isStreaming: false }))
            setIsStreaming(false)
            updateConversation?.(convId, { messageCount: (activeConversation?.messageCount || 0) + 1 })
          } else if (type === 'error') {
            updateLastAssistantMessage(convId, msg => ({
              content: msg.content || 'An error occurred. Please try again.',
              isError: true,
              isStreaming: false,
            }))
            setIsStreaming(false)
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return

      updateLastAssistantMessage(convId, msg => ({
        content: msg.content || 'Connection error. Please check the backend is running.',
        isError: true,
        isStreaming: false,
      }))
      setIsStreaming(false)
    } finally {
      setIsStreaming(false)
      setIsSearching(false)
      setSearchStatus('')
      abortRef.current = null
    }
  }, [isStreaming, model, systemPrompt, addMessage, updateLastAssistantMessage, updateConversation, activeConversation, addAgentStep, updateLastAgentStep])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  const clearMessages = useCallback((convId) => {
    setMessages(convId, [])
  }, [setMessages])

  return {
    getMessages,
    sendMessage,
    stopStreaming,
    clearMessages,
    isStreaming,
    isSearching,
    searchStatus,
    agentStepsByConv,
  }
}
