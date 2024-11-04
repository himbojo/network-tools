// File: backend/cmd/server/main.go
package main

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	wsfiber "github.com/gofiber/websocket/v2" // Added alias to avoid naming conflict

	"backend/internal/api/middleware"
	"backend/internal/api/websocket"
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
	app.Get("/ws", wsfiber.New(websocket.Handler)) // Using the alias here

	// Start server
	log.Fatal(app.Listen(":8080"))
}
