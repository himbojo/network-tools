// File: backend/internal/validation/dns_test.go
package validation

import (
	"strings"
	"testing"
)

func TestValidateDomain(t *testing.T) {
	tests := []struct {
		name    string
		domain  string
		wantErr bool
	}{
		{"Valid domain", "example.com", false},
		{"Valid subdomain", "sub.example.com", false},
		{"Valid domain with hyphen", "my-example.com", false},
		{"Domain too long", strings.Repeat("a", 254) + ".com", true},
		{"Empty domain", "", true},
		{"Invalid characters", "example!.com", true},
		{"Double hyphen", "exam--ple.com", true},
		{"Starting hyphen", "-example.com", true},
		{"Ending hyphen", "example-.com", true},
		{"No dot", "examplecom", true},
		{"Valid with trailing dot", "example.com.", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateDomain(tt.domain)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateDomain() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateIPv4(t *testing.T) {
	tests := []struct {
		name    string
		ip      string
		wantErr bool
	}{
		{"Valid IP", "192.168.1.1", false},
		{"Valid zero IP", "0.0.0.0", false},
		{"Valid broadcast IP", "255.255.255.255", false},
		{"Empty IP", "", true},
		{"Invalid format", "192.168.1", true},
		{"Invalid numbers", "256.1.2.3", true},
		{"Invalid characters", "192.168.1.a", true},
		{"Too many octets", "192.168.1.1.1", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateIPv4(tt.ip)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateIPv4() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidatePingCount(t *testing.T) {
	tests := []struct {
		name    string
		count   int
		wantErr bool
	}{
		{"Valid minimum", 1, false},
		{"Valid maximum", 30, false},
		{"Valid middle", 15, false},
		{"Too low", 0, true},
		{"Too high", 31, true},
		{"Negative", -1, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidatePingCount(tt.count)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidatePingCount() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateRecordType(t *testing.T) {
	tests := []struct {
		name       string
		recordType string
		wantErr    bool
	}{
		{"Valid A record", "A", false},
		{"Valid MX record", "MX", false},
		{"Valid lowercase", "cname", false},
		{"Invalid record", "INVALID", true},
		{"Empty record", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateRecordType(tt.recordType)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateRecordType() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateDigParameters(t *testing.T) {
	tests := []struct {
		name    string
		params  map[string]interface{}
		wantErr bool
	}{
		{"Valid parameter", map[string]interface{}{"short": true}, false},
		{"Multiple valid parameters", map[string]interface{}{"short": true, "trace": true}, false},
		{"Invalid parameter", map[string]interface{}{"invalid": true}, true},
		{"Mixed parameters", map[string]interface{}{"short": true, "invalid": true}, true},
		{"Empty parameters", map[string]interface{}{}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateDigParameters(tt.params)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateDigParameters() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
