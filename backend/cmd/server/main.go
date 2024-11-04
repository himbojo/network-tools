package main

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/websocket/v2"

	wsHandler "backend/internal/api/websocket"
)

func main() {
	app := fiber.New(fiber.Config{
		ReadTimeout:  time.Minute,
		WriteTimeout: time.Minute,
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New())

	// WebSocket upgrade middleware
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	// WebSocket route
	app.Get("/ws", websocket.New(wsHandler.Handler))

	log.Fatal(app.Listen(":8080"))
}
