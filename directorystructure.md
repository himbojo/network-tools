```
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
    ├── cmd/
    │   └── server/
    │       └── main.go
    ├── internal/
    │   ├── api/
    │   │   ├── handlers/
    │   │   │   ├── ping.go
    │   │   │   └── dig.go
    │   │   ├── middleware/
    │   │   │   ├── ratelimit.go
    │   │   │   └── logging.go
    │   │   └── websocket/
    │   │       └── handler.go
    │   ├── tools/
    │   │   ├── ping.go
    │   │   └── dig.go
    │   ├── validation/
    │   │   └── input.go
    │   └── config/
    │       └── config.go
    ├── pkg/
    │   └── logger/
    │       └── logger.go
    └── go.mod
```