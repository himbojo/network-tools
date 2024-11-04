// File: backend/internal/tools/dig.go

package tools

type DigParams struct {
	Domain     string `json:"domain" validate:"required"`
	RecordType string `json:"recordType" validate:"required,oneof=A AAAA MX NS TXT CNAME SOA PTR"`
	Nameserver string `json:"nameserver"`
	Parameters struct {
		Short bool `json:"short"`
	} `json:"parameters"`
}
