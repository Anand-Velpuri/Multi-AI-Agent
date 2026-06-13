# Multi-AI Agent — React Frontend

A premium AI Agent chat interface built with React + Vite, Tailwind CSS, Framer Motion, and shadcn/ui design patterns.

## Quick Start

```bash
cd app/frontend/react

# Install dependencies
npm install

# Start dev server (with proxy to backend at :9090)
npm run dev
```

Open **http://localhost:5173**

> Make sure your FastAPI backend is running first:
> ```bash
> uvicorn app.backend.api:app --host 0.0.0.0 --port 9090
> ```

## Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 + @tailwindcss/typography |
| Animation | Framer Motion 11 |
| Markdown | react-markdown + rehype-highlight + remark-gfm |
| Icons | Lucide React |
| State | React hooks + localStorage |

## Structure

```
src/
├── components/
│   ├── layout/        AppShell
│   ├── sidebar/       Sidebar (conversations, model selector)
│   ├── chat/          ChatArea, MessageBubble, SourcesPanel,
│   │                  SearchProgress, StreamingIndicator, ChatHeader
│   └── input/         ChatInput
├── hooks/
│   ├── useChat.js        SSE streaming core
│   ├── useConversations.js  Persistent conversation history
│   └── useSidebar.js     Sidebar open/collapsed state
├── lib/
│   └── utils.js
├── App.jsx
└── index.css
```

## Backend API

Connects to `POST /chat/stream` with SSE events:

| Event | Meaning |
|---|---|
| `checkpoint` | Conversation checkpoint ID |
| `content` | Token to append |
| `search_start` | Web search started |
| `search_results` | Sources array |
| `end` | Stream complete |
| `error` | Error occurred |

## Build

```bash
npm run build   # output → dist/
npm run preview # preview production build
```
