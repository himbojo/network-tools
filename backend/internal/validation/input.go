// File: backend/internal/validation/input.go
package validation

import (
	"net"
	"regexp"
)

var (
	hostnameRegex = regexp.MustCompile(`^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$`)
)

func ValidateHostname(hostname string) bool {
	return hostnameRegex.MatchString(hostname)
}

func ValidateIP(ip string) bool {
	return net.ParseIP(ip) != nil
}

func ValidateCommandParams(params interface{}) error {
	// TODO: Implement parameter validation
	return nil
}
