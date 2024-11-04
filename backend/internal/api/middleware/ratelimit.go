// File: backend/internal/api/middleware/ratelimit.go
package middleware

import (
	"sync"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/time/rate"
)

type IPRateLimiter struct {
	ips map[string]*rate.Limiter
	mu  *sync.RWMutex
	r   rate.Limit
	b   int
}

func RateLimit() fiber.Handler {
	// TODO: Implement rate limiting middleware
	// Limit: 10 requests per minute
	return func(c *fiber.Ctx) error {
		return c.Next()
	}
}
