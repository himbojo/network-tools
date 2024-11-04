network-tools/
├── README.md
├── .gitignore
├── docker-compose.yml
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   └── OutputTerminal.tsx
│   │   │   ├── tools/
│   │   │   │   ├── PingTool.tsx
│   │   │   │   └── DigTool.tsx
│   │   │   ├── ui/
│   │   │   │   └── alert.tsx
│   │   │   └── common/
│   │   │       ├── CommandPreview.tsx
│   │   │       └── ToolInput.tsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useTheme.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── services/
│   │   │   └── websocket.ts
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   └── formatters.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   └── public/
│
└── backend/
    ├── go.mod
    ├── go.sum
    ├── cmd/
    │   └── server/
    │       └── main.go
    ├── internal/
    │   ├── api/
    │   │   ├── middleware/
    │   │   │   ├── ratelimit.go
    │   │   │   ├── websocket.go
    │   │   │   └── logging.go
    │   │   └── websocket/
    │   │       └── handler.go
    │   ├── tools/
    │   │   ├── ping.go
    │   │   └── dig.go
    │   └── config/
    │       └── config.go
    └── pkg/
        └── logger/
            └── logger.go