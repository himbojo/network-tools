// File: backend/internal/validation/dns.go
package validation

import (
	"fmt"
	"net"
	"regexp"
	"strings"
)

const (
	maxDomainLength = 253
	maxLabelLength  = 63
	maxPingCount    = 30
	minPingCount    = 1
)

var (
	// DNS label validation as per RFC 1035
	labelRegex = regexp.MustCompile(`^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$`)

	// Valid record types
	validRecordTypes = map[string]bool{
		"A":     true,
		"AAAA":  true,
		"MX":    true,
		"NS":    true,
		"TXT":   true,
		"CNAME": true,
		"SOA":   true,
		"PTR":   true,
	}

	// Allowed dig parameters
	allowedDigParams = map[string]bool{
		"short":  true,
		"trace":  true,
		"answer": true,
	}
)

// ValidationError represents a validation error with a specific message
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// ValidateDomain checks if a domain name is valid according to RFC 1035
func ValidateDomain(domain string) error {
	if domain == "" {
		return &ValidationError{Field: "domain", Message: "domain cannot be empty"}
	}

	// Check total length
	if len(domain) > maxDomainLength {
		return &ValidationError{
			Field:   "domain",
			Message: fmt.Sprintf("domain name length cannot exceed %d characters", maxDomainLength),
		}
	}

	// Remove trailing dot if present
	domain = strings.TrimSuffix(domain, ".")

	// Split into labels
	labels := strings.Split(domain, ".")
	if len(labels) < 2 {
		return &ValidationError{
			Field:   "domain",
			Message: "domain must have at least one dot separator",
		}
	}

	// Validate each label
	for i, label := range labels {
		if err := validateLabel(label, i == len(labels)-1); err != nil {
			return err
		}
	}

	return nil
}

// validateLabel checks if a single DNS label is valid
func validateLabel(label string, isTopLevel bool) error {
	if len(label) > maxLabelLength {
		return &ValidationError{
			Field:   "domain",
			Message: fmt.Sprintf("label length cannot exceed %d characters", maxLabelLength),
		}
	}

	if !labelRegex.MatchString(label) {
		return &ValidationError{
			Field:   "domain",
			Message: "invalid label format",
		}
	}

	return nil
}

// ValidateIPv4 checks if a string is a valid IPv4 address
func ValidateIPv4(ip string) error {
	if ip == "" {
		return &ValidationError{Field: "ip", Message: "IP address cannot be empty"}
	}

	parsedIP := net.ParseIP(ip)
	if parsedIP == nil {
		return &ValidationError{Field: "ip", Message: "invalid IP address format"}
	}

	// Ensure it's an IPv4 address
	if parsedIP.To4() == nil {
		return &ValidationError{Field: "ip", Message: "IP address must be IPv4"}
	}

	return nil
}

// ValidatePingCount ensures the ping count is within allowed range
func ValidatePingCount(count int) error {
	if count < minPingCount || count > maxPingCount {
		return &ValidationError{
			Field:   "count",
			Message: fmt.Sprintf("count must be between %d and %d", minPingCount, maxPingCount),
		}
	}
	return nil
}

// ValidateRecordType checks if the DNS record type is valid
func ValidateRecordType(recordType string) error {
	if !validRecordTypes[strings.ToUpper(recordType)] {
		return &ValidationError{
			Field:   "recordType",
			Message: "invalid DNS record type",
		}
	}
	return nil
}

// ValidateDigParameters validates additional dig command parameters
func ValidateDigParameters(params map[string]interface{}) error {
	for param := range params {
		if !allowedDigParams[param] {
			return &ValidationError{
				Field:   "parameters",
				Message: fmt.Sprintf("parameter '%s' is not allowed", param),
			}
		}
	}
	return nil
}

// ValidateTarget validates either an IP address or domain name
func ValidateTarget(target string) error {
	if err := ValidateIPv4(target); err == nil {
		return nil
	}
	return ValidateDomain(target)
}
