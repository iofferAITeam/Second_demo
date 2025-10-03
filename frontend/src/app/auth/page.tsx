import { Suspense } from 'react'
import LoginForm from '@/components/auth/LoginForm'

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}