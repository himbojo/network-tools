// File: backend/internal/api/middleware/logging.go
package middleware

import (
	"github.com/gofiber/fiber/v2"
)

func Logging() fiber.Handler {
	// TODO: Implement logging middleware
	return func(c *fiber.Ctx) error {
		return c.Next()
	}
}
