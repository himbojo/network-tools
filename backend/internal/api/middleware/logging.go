// File: backend/internal/api/middleware/logging.go
package middleware

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Logging middleware logs request information
func Logging() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()

		// Continue with the next middleware/handler
		err := c.Next()

		// Log after processing
		log.Printf(
			"%s %s - %v - %v",
			c.Method(),
			c.Path(),
			c.Response().StatusCode(),
			time.Since(start),
		)

		return err
	}
}
