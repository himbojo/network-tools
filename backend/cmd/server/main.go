// File: backend/cmd/server/main.go
package main

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/websocket/v2"

	"network-tools/internal/api/handlers"
	"network-tools/internal/api/middleware"
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
	app.Get("/ws", websocket.New(handlers.WebSocketHandler))

	// Start server
	log.Fatal(app.Listen(":8080"))
}
