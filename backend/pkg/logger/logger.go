// File: backend/pkg/logger/logger.go
package logger

import (
	"log"
	"os"
)

type Logger struct {
	cmdLogger *log.Logger
	errLogger *log.Logger
}

func New() *Logger {
	return &Logger{
		cmdLogger: log.New(os.Stdout, "[CMD] ", log.LstdFlags),
		errLogger: log.New(os.Stderr, "[ERROR] ", log.LstdFlags),
	}
}

func (l *Logger) LogCommand(toolType, command string, params map[string]interface{}) {
	// TODO: Implement command logging
}

func (l *Logger) LogError(err error, context string) {
	// TODO: Implement error logging
}
