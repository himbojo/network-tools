// File: frontend/src/utils/formatters.ts
// Utility functions for formatting output and commands
export const formatCommand = {
    ping: (target: string, count: number): string => {
      return `$ ping -c ${count} ${target}`
    },
    
    dig: (domain: string, recordType: string, parameters: Record<string, unknown> = {}): string => {
      const paramString = Object.entries(parameters)
        .map(([key, value]) => `+${key}${value ? `=${value}` : ''}`)
        .join(' ')
      return `$ dig ${domain} ${recordType} ${paramString}`.trim()
    },
  }
  
  // Format terminal output with syntax highlighting
  export const formatTerminalOutput = (line: string): string => {
    // TODO: Implement syntax highlighting for command output
    if (line.startsWith('$')) {
      return `<span class="text-green-400">${line}</span>`
    }
    return line
  }
  
  // Helper function to sanitize command parameters
  export const sanitizeParams = <T extends Record<string, unknown>>(
    params: T,
    allowedKeys: Array<keyof T>
  ): Partial<T> => {
    return Object.fromEntries(
      Object.entries(params).filter(([key]) => allowedKeys.includes(key as keyof T))
    ) as Partial<T>
  }
  
  // Type definitions for validation
  export interface ValidationResult<T> {
    isValid: boolean
    value?: T
    error?: string
  }
  
  export interface ValidationOptions {
    validateOnChange?: boolean
    validateOnBlur?: boolean
  }