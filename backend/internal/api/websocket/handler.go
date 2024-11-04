package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"sync"
	"time"

	"github.com/gofiber/websocket/v2"
)

type CommandRequest struct {
	Type       string                 `json:"type"`
	Command    string                 `json:"command"`
	Parameters map[string]interface{} `json:"parameters"`
}

type CommandResponse struct {
	Output string `json:"output"`
	Error  string `json:"error,omitempty"`
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
				if err := c.WriteJSON(CommandResponse{Error: err.Error()}); err != nil {
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
			errorChan <- err
			continue
		}

		// Handle the command in a goroutine
		go func(cmd CommandRequest) {
			switch cmd.Type {
			case "ping":
				handlePingCommand(cmd, outputChan, errorChan)
			case "dig":
				handleDigCommand(cmd, outputChan, errorChan)
			default:
				errorChan <- fmt.Errorf("unknown command type: %s", cmd.Type)
			}
		}(cmd)
	}
}

func handlePingCommand(cmd CommandRequest, output chan<- string, errChan chan<- error) {
	target, ok := cmd.Parameters["target"].(string)
	if !ok {
		errChan <- fmt.Errorf("invalid target parameter")
		return
	}

	count, ok := cmd.Parameters["count"].(float64)
	if !ok {
		errChan <- fmt.Errorf("invalid count parameter")
		return
	}

	// Check if ping command is available
	pingPath, err := exec.LookPath("ping")
	if err != nil {
		errChan <- fmt.Errorf("ping command not available")
		return
	}

	// Construct the ping command
	pingCmd := exec.Command(pingPath, "-c", fmt.Sprintf("%.0f", count), target)

	// Get command output
	stdout, err := pingCmd.StdoutPipe()
	if err != nil {
		errChan <- err
		return
	}

	// Start the command
	if err := pingCmd.Start(); err != nil {
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
	if err := pingCmd.Wait(); err != nil {
		errChan <- err
	}
}

func handleDigCommand(cmd CommandRequest, output chan<- string, errChan chan<- error) {
	domain, ok := cmd.Parameters["domain"].(string)
	if !ok {
		errChan <- fmt.Errorf("invalid domain parameter")
		return
	}

	recordType, ok := cmd.Parameters["recordType"].(string)
	if !ok {
		errChan <- fmt.Errorf("invalid record type parameter")
		return
	}

	// Check if dig command is available
	digPath, err := exec.LookPath("dig")
	if err != nil {
		errChan <- fmt.Errorf("dig command not available")
		return
	}

	// Start with base arguments
	args := []string{}

	// Add nameserver if provided
	if nameserver, ok := cmd.Parameters["nameserver"].(string); ok && nameserver != "" {
		args = append(args, fmt.Sprintf("@%s", nameserver))
	}

	// Add domain and record type
	args = append(args, domain, recordType)

	// Add parameters
	if params, ok := cmd.Parameters["parameters"].(map[string]interface{}); ok {
		// Handle boolean parameters
		paramMap := map[string]string{
			"short":   "+short",
			"trace":   "+trace",
			"stats":   "+stats",
			"tcp":     "+tcp",
			"dnssec":  "+dnssec",
			"recurse": "+recurse",
		}

		for key, flag := range paramMap {
			if value, exists := params[key]; exists {
				if enabled, ok := value.(bool); ok && enabled {
					args = append(args, flag)
				} else if key == "recurse" && !enabled {
					// Special case for recurse, as it's enabled by default
					args = append(args, "+norecurse")
				}
			}
		}
	}

	// Execute command
	digCmd := exec.Command(digPath, args...)

	// Get command output
	stdout, err := digCmd.StdoutPipe()
	if err != nil {
		errChan <- err
		return
	}

	// Start the command
	if err := digCmd.Start(); err != nil {
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
	if err := digCmd.Wait(); err != nil {
		errChan <- err
	}
}
