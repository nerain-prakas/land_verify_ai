'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  isOffline?: boolean
}

/**
 * Error boundary for database connectivity issues
 * Provides fallback UI when Supabase is unreachable
 */
export class DatabaseErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Detect if error is related to database connectivity
    const isOffline = error.message.includes('connect') || 
                     error.message.includes('timeout') ||
                     error.message.includes('ECONNREFUSED') ||
                     error.message.includes('Database')

    return { hasError: true, error, isOffline }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DatabaseErrorBoundary caught an error:', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, isOffline: false })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <DatabaseOfflineFallback 
          error={this.state.error}
          isOffline={this.state.isOffline}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Fallback UI component for offline database scenarios
 */
export function DatabaseOfflineFallback({ 
  error, 
  isOffline, 
  onRetry 
}: { 
  error?: Error
  isOffline?: boolean
  onRetry: () => void 
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 text-center">
        <div className="mb-4">
          {isOffline ? (
            <WifiOff className="w-12 h-12 text-orange-500 mx-auto" />
          ) : (
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isOffline ? 'Database Offline' : 'Something went wrong'}
        </h2>
        
        <p className="text-gray-600 mb-4">
          {isOffline 
            ? 'Our database is temporarily unavailable. You can still browse with limited functionality.'
            : 'An unexpected error occurred. Please try again.'}
        </p>

        {error && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error details
            </summary>
            <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
              {error.message}
            </pre>
          </details>
        )}
        
        <div className="space-y-3">
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          {isOffline && (
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/profile?offline=true'}
              className="w-full"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Continue in Offline Mode
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

/**
 * Hook to check and display database connectivity status
 */
export function useDataBaseHealth() {
  const checkHealth = async () => {
    try {
      const response = await fetch('/api/health/database')
      const data = await response.json()
      return data.isHealthy
    } catch (error) {
      return false
    }
  }

  return { checkHealth }
}

/**
 * Simple inline component for offline indicators
 */
export function OfflineIndicator({ isOffline }: { isOffline: boolean }) {
  if (!isOffline) return null

  return (
    <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 mb-4">
      <div className="flex items-center">
        <WifiOff className="w-5 h-5 text-orange-600 mr-2" />
        <div>
          <h3 className="text-orange-800 font-medium text-sm">
            Offline Mode
          </h3>
          <p className="text-orange-700 text-xs">
            Database unavailable. Some features may be limited.
          </p>
        </div>
      </div>
    </div>
  )
}