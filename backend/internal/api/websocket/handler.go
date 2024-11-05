package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"sync"
	"time"

	"backend/internal/validation"

	"github.com/gofiber/websocket/v2"
)

// CommandRequest represents the incoming WebSocket message structure
type CommandRequest struct {
	Type       string                 `json:"type"`
	Command    string                 `json:"command"`
	Parameters map[string]interface{} `json:"parameters"`
}

// CommandResponse represents the outgoing WebSocket message structure
type CommandResponse struct {
	Output string `json:"output,omitempty"`
	Error  string `json:"error,omitempty"`
}

// PingParams represents the expected parameters for ping command
type PingParams struct {
	Target string `json:"target"`
	Count  int    `json:"count"`
}

// DigParams represents the expected parameters for dig command
type DigParams struct {
	Domain     string                 `json:"domain"`
	RecordType string                 `json:"recordType"`
	Nameserver string                 `json:"nameserver,omitempty"`
	Parameters map[string]interface{} `json:"parameters"`
}

// validatePingParams validates ping command parameters
func validatePingParams(params map[string]interface{}) (*PingParams, error) {
	var p PingParams

	// Extract and validate target
	targetRaw, ok := params["target"]
	if !ok {
		return nil, &validation.ValidationError{Field: "target", Message: "target is required"}
	}
	if target, ok := targetRaw.(string); ok {
		if err := validation.ValidateTarget(target); err != nil {
			return nil, err
		}
		p.Target = target
	} else {
		return nil, &validation.ValidationError{Field: "target", Message: "invalid target format"}
	}

	// Extract and validate count
	countRaw, ok := params["count"]
	if !ok {
		return nil, &validation.ValidationError{Field: "count", Message: "count is required"}
	}

	// Handle JSON number type conversion
	var count int
	switch v := countRaw.(type) {
	case float64:
		count = int(v)
	case int:
		count = v
	default:
		return nil, &validation.ValidationError{Field: "count", Message: "invalid count format"}
	}

	if err := validation.ValidatePingCount(count); err != nil {
		return nil, err
	}
	p.Count = count

	return &p, nil
}

// validateDigParams validates dig command parameters
func validateDigParams(params map[string]interface{}) (*DigParams, error) {
	var d DigParams

	// Extract and validate domain
	domainRaw, ok := params["domain"]
	if !ok {
		return nil, &validation.ValidationError{Field: "domain", Message: "domain is required"}
	}
	if domain, ok := domainRaw.(string); ok {
		if err := validation.ValidateDomain(domain); err != nil {
			return nil, err
		}
		d.Domain = domain
	} else {
		return nil, &validation.ValidationError{Field: "domain", Message: "invalid domain format"}
	}

	// Extract and validate record type
	recordTypeRaw, ok := params["recordType"]
	if !ok {
		return nil, &validation.ValidationError{Field: "recordType", Message: "record type is required"}
	}
	if recordType, ok := recordTypeRaw.(string); ok {
		if err := validation.ValidateRecordType(recordType); err != nil {
			return nil, err
		}
		d.RecordType = recordType
	} else {
		return nil, &validation.ValidationError{Field: "recordType", Message: "invalid record type format"}
	}

	// Extract and validate nameserver (optional)
	if nameserverRaw, ok := params["nameserver"]; ok {
		if nameserver, ok := nameserverRaw.(string); ok && nameserver != "" {
			if err := validation.ValidateTarget(nameserver); err != nil {
				return nil, &validation.ValidationError{Field: "nameserver", Message: "invalid nameserver format"}
			}
			d.Nameserver = nameserver
		}
	}

	// Extract and validate additional parameters
	if paramsRaw, ok := params["parameters"]; ok {
		if parameters, ok := paramsRaw.(map[string]interface{}); ok {
			if err := validation.ValidateDigParameters(parameters); err != nil {
				return nil, err
			}
			d.Parameters = parameters
		}
	}

	return &d, nil
}

// Handler handles WebSocket connections
func Handler(c *websocket.Conn) {
	var writeMu sync.Mutex

	// Create channels for command output and errors
	outputChan := make(chan string)
	errorChan := make(chan error)
	done := make(chan struct{})

	defer func() {
		close(outputChan)
		close(errorChan)
		close(done)
		c.Close()
	}()

	// Start a goroutine to handle sending messages back to the client
	go func() {
		for {
			select {
			case <-done:
				return
			case output := <-outputChan:
				writeMu.Lock()
				if err := c.WriteJSON(CommandResponse{Output: output}); err != nil {
					log.Printf("Error writing to websocket: %v", err)
					writeMu.Unlock()
					return
				}
				writeMu.Unlock()
			case err := <-errorChan:
				writeMu.Lock()
				var errMsg string
				if valErr, ok := err.(*validation.ValidationError); ok {
					errMsg = fmt.Sprintf("%s: %s", valErr.Field, valErr.Message)
				} else {
					errMsg = err.Error()
				}
				if err := c.WriteJSON(CommandResponse{Error: errMsg}); err != nil {
					log.Printf("Error writing error to websocket: %v", err)
					writeMu.Unlock()
					return
				}
				writeMu.Unlock()
			}
		}
	}()

	// Handle pings
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-done:
				return
			case <-ticker.C:
				writeMu.Lock()
				if err := c.WriteMessage(websocket.PingMessage, nil); err != nil {
					log.Printf("Error sending ping: %v", err)
					writeMu.Unlock()
					return
				}
				writeMu.Unlock()
			}
		}
	}()

	// Main message handling loop
	for {
		_, msg, err := c.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("websocket error: %v", err)
			}
			return
		}

		var cmd CommandRequest
		if err := json.Unmarshal(msg, &cmd); err != nil {
			errorChan <- fmt.Errorf("invalid message format: %v", err)
			continue
		}

		// Handle the command in a goroutine
		go func(cmd CommandRequest) {
			switch cmd.Type {
			case "ping":
				params, err := validatePingParams(cmd.Parameters)
				if err != nil {
					errorChan <- err
					return
				}
				handlePingCommand(params, outputChan, errorChan)
			case "dig":
				params, err := validateDigParams(cmd.Parameters)
				if err != nil {
					errorChan <- err
					return
				}
				handleDigCommand(params, outputChan, errorChan)
			default:
				errorChan <- fmt.Errorf("unknown command type: %s", cmd.Type)
			}
		}(cmd)
	}
}

func handlePingCommand(params *PingParams, output chan<- string, errChan chan<- error) {
	// Check if ping command is available
	pingPath, err := exec.LookPath("ping")
	if err != nil {
		errChan <- fmt.Errorf("ping command not available")
		return
	}

	// Construct the ping command
	args := []string{"-c", fmt.Sprintf("%d", params.Count), params.Target}
	cmd := exec.Command(pingPath, args...)

	// Get command output
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		errChan <- err
		return
	}

	// Start the command
	if err := cmd.Start(); err != nil {
		errChan <- err
		return
	}

	// Read output
	buf := make([]byte, 1024)
	for {
		n, err := stdout.Read(buf)
		if n > 0 {
			output <- string(buf[:n])
		}
		if err != nil {
			break
		}
	}

	// Wait for command to complete
	if err := cmd.Wait(); err != nil {
		errChan <- err
	}
}

func handleDigCommand(params *DigParams, output chan<- string, errChan chan<- error) {
	// Check if dig command is available
	digPath, err := exec.LookPath("dig")
	if err != nil {
		errChan <- fmt.Errorf("dig command not available")
		return
	}

	// Start with base arguments
	args := []string{}

	// Add nameserver if provided
	if params.Nameserver != "" {
		args = append(args, fmt.Sprintf("@%s", params.Nameserver))
	}

	// Add domain and record type
	args = append(args, params.Domain, params.RecordType)

	// Add additional parameters
	for key, value := range params.Parameters {
		if boolVal, ok := value.(bool); ok && boolVal {
			args = append(args, fmt.Sprintf("+%s", key))
		}
	}

	// Execute command
	cmd := exec.Command(digPath, args...)

	// Get command output
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		errChan <- err
		return
	}

	// Start the command
	if err := cmd.Start(); err != nil {
		errChan <- err
		return
	}

	// Read output
	buf := make([]byte, 1024)
	for {
		n, err := stdout.Read(buf)
		if n > 0 {
			output <- string(buf[:n])
		}
		if err != nil {
			break
		}
	}

	// Wait for command to complete
	if err := cmd.Wait(); err != nil {
		errChan <- err
	}
}
