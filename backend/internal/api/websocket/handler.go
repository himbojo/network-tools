// File: backend/internal/api/websocket/handler.go
package websocket

import (
	"fmt"
	"os/exec"

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

func Handler(c *websocket.Conn) {
	// Create a channel for command output
	outputChan := make(chan string)
	errorChan := make(chan error)

	defer func() {
		close(outputChan)
		close(errorChan)
		c.Close()
	}()

	// Start a goroutine to handle sending messages back to the client
	go func() {
		for {
			select {
			case output := <-outputChan:
				response := CommandResponse{
					Output: output,
				}
				if err := c.WriteJSON(response); err != nil {
					return
				}
			case err := <-errorChan:
				response := CommandResponse{
					Error: err.Error(),
				}
				if err := c.WriteJSON(response); err != nil {
					return
				}
			}
		}
	}()

	// Main message handling loop
	for {
		var cmd CommandRequest
		if err := c.ReadJSON(&cmd); err != nil {
			// Client disconnected or bad message
			return
		}

		// Handle the command in a separate goroutine
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

func handlePingCommand(cmd CommandRequest, output chan<- string, errorChan chan<- error) {
	target, ok := cmd.Parameters["target"].(string)
	if !ok {
		errorChan <- fmt.Errorf("invalid target parameter")
		return
	}

	count, ok := cmd.Parameters["count"].(float64)
	if !ok {
		errorChan <- fmt.Errorf("invalid count parameter")
		return
	}

	// Check if ping command is available
	pingPath, err := exec.LookPath("ping")
	if err != nil {
		errorChan <- fmt.Errorf("ping command not available on system")
		return
	}

	// Construct and execute the ping command
	pingCmd := exec.Command(pingPath, "-c", fmt.Sprintf("%.0f", count), target)

	// Get command output pipe
	stdout, err := pingCmd.StdoutPipe()
	if err != nil {
		errorChan <- err
		return
	}

	// Start the command
	if err := pingCmd.Start(); err != nil {
		errorChan <- err
		return
	}

	// Read output line by line
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
		errorChan <- err
	}
}

func handleDigCommand(cmd CommandRequest, output chan<- string, errorChan chan<- error) {
	domain, ok := cmd.Parameters["domain"].(string)
	if !ok {
		errorChan <- fmt.Errorf("invalid domain parameter")
		return
	}

	recordType, ok := cmd.Parameters["recordType"].(string)
	if !ok {
		errorChan <- fmt.Errorf("invalid record type parameter")
		return
	}

	// Check if dig command is available
	digPath, err := exec.LookPath("dig")
	if err != nil {
		errorChan <- fmt.Errorf("dig command not available on system")
		return
	}

	// Construct and execute the dig command
	args := []string{domain, recordType}

	// Add any additional parameters
	if params, ok := cmd.Parameters["parameters"].(map[string]interface{}); ok {
		for key, value := range params {
			if value.(bool) {
				args = append(args, fmt.Sprintf("+%s", key))
			}
		}
	}

	digCmd := exec.Command(digPath, args...)

	// Get command output pipe
	stdout, err := digCmd.StdoutPipe()
	if err != nil {
		errorChan <- err
		return
	}

	// Start the command
	if err := digCmd.Start(); err != nil {
		errorChan <- err
		return
	}

	// Read output line by line
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
		errorChan <- err
	}
}
