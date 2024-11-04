// File: frontend/src/components/common/ToolInput.tsx
import { FC, InputHTMLAttributes } from 'react'

interface ToolInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const ToolInput: FC<ToolInputProps> = ({ label, error, ...props }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">
        {label}
      </label>
      <input
        className="mt-1 block w-full rounded-md border-gray-300"
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}

export default ToolInput