// File: backend/cmd/server/main.go
package main

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/websocket/v2"

	"network-tools/backend/internal/api/middleware"
	"network-tools/backend/internal/api/websocket"
)

func main() {
	app := fiber.New(fiber.Config{
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	})

	// Middleware
	app.Use(logger.New())
	app.Use(middleware.RateLimit())

	// WebSocket route
	app.Use("/ws", middleware.UpgradeWebSocket)
	app.Get("/ws", websocket.New(websocket.Handler))

	// Start server
	log.Fatal(app.Listen(":8080"))
}
