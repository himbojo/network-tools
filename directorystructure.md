network-tools/
├── backend/
│   ├── cmd/
│   │   ├── server/
│   │   │   └── main.go
│   └── go.mod
│   └── go.sum
│   ├── internal/
│   │   ├── api/
│   │   │   ├── middleware/
│   │   │   │   └── logging.go
│   │   │   │   └── ratelimit.go
│   │   │   │   └── websocket.go
│   │   │   ├── websocket/
│   │   │   │   └── handler.go
│   │   ├── tools/
│   │   │   └── dig.go
│   │   │   └── ping.go
│   │   ├── validation/
│   │   │   └── input.go
│   ├── pkg/
│   │   ├── logger/
│   │   │   └── logger.go
└── directorystructure.md
├── frontend/
│   └── eslint.config.js
│   └── index.html
│   ├── node_modules/
│   └── package.json
│   └── package-lock.json
│   └── postcss.config.js
│   ├── public/
│   │   └── vite.svg
│   └── README.md
│   ├── src/
│   │   └── App.tsx
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   └── ClearCacheButton.tsx
│   │   │   │   └── ToolInput.tsx
│   │   │   ├── layout/
│   │   │   │   └── OutputTerminal.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   │   └── ThemeToggle.tsx
│   │   │   ├── tools/
│   │   │   │   └── DigTool.tsx
│   │   │   │   └── PingTool.tsx
│   │   │   ├── ui/
│   │   │   │   └── alert.tsx
│   │   ├── hooks/
│   │   │   └── useLocalStorage.ts
│   │   │   └── useTheme.ts
│   │   │   └── useWebSocket.ts
│   │   └── index.css
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   └── main.tsx
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx
│   │   ├── services/
│   │   │   └── websocket.ts
│   │   ├── utils/
│   │   │   └── formatters.ts
│   │   │   └── validation.ts
│   │   └── vite-env.d.ts
│   └── tailwind.config.js
│   └── tsconfig.app.json
│   └── tsconfig.json
│   └── tsconfig.node.json
│   └── vite.config.ts
└── masterplan.md