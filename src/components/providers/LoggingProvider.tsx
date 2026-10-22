'use client'

import React, { useEffect, useRef } from 'react'
import { logger } from '@/lib/logger'

/**
 * Binds the browser-side telemetry logger to the current session.
 *
 * Feeds the authenticated user id into `logger` so client errors, warnings and
 * user actions flushed to `/api/telemetry` are attributable, and replays any
 * telemetry that failed to send in a previous session.
 */
export function LoggingProvider({
  userId,
  children,
}: {
  userId?: string
  children: React.ReactNode
}) {
  const retriedRef = useRef(false)

  useEffect(() => {
    if (userId) {
      logger.setUserId(userId)
    } else {
      logger.clearUser()
    }
  }, [userId])

  useEffect(() => {
    if (retriedRef.current) return
    retriedRef.current = true
    void logger.retryFailedLogs()
  }, [])

  return <>{children}</>
}

export default LoggingProvider