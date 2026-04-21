'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { account } from '@/_lib/appwrite'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')

  useEffect(() => {
    const userId = searchParams.get('userId')
    const secret = searchParams.get('secret')

    if (!userId || !secret) {
      setStatus('error')
      return
    }

    account.updateVerification(userId, secret)
      .then(() => {
        setStatus('success')
        setTimeout(() => router.push('/dashboard'), 2000)
      })
      .catch(() => setStatus('error'))
  }, [searchParams, router])

  return (
    <div className="text-center max-w-sm">
      {status === 'verifying' && (
        <>
          <h1 className="text-2xl font-bold">Verifying your email...</h1>
          <p className="mt-2 text-muted-foreground text-sm">Please wait a moment.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h1 className="text-2xl font-bold text-green-600">Email verified!</h1>
          <p className="mt-2 text-muted-foreground text-sm">Redirecting to dashboard...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="text-2xl font-bold text-red-600">Verification failed</h1>
          <p className="mt-2 text-muted-foreground text-sm">The link may be invalid or expired. Try signing in and requesting a new verification email.</p>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Suspense fallback={
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
