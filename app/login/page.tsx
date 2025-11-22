'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { login, signup, type ActionResult } from './actions'
import { useToast, ToastContainer } from '@/components/toast'

function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toasts, showToast, removeToast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result: ActionResult = isSignUp
      ? await signup(formData)
      : await login(formData)

    setIsLoading(false)

    if (result.success) {
      if (result.message) {
        showToast(result.message, 'success')
      }
      if (result.redirect) {
        setTimeout(() => {
          router.push(result.redirect!)
        }, result.message ? 2000 : 0)
      }
    } else {
      showToast(result.message || 'خطایی رخ داد', 'error')
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isSignUp ? 'ثبت نام' : 'ورود'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isSignUp
                ? 'حساب کاربری جدید بسازید'
                : 'به حساب کاربری خود وارد شوید'}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
          {searchParams.get('next') && (
            <input type="hidden" name="next" value={searchParams.get('next')!} />
          )}
          
          {isSignUp && (
            <div>
              <label
                htmlFor="fullname"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                نام
              </label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                placeholder="نام خود را وارد کنید"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              ایمیل
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              placeholder="ایمیل خود را وارد کنید"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              رمز عبور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              placeholder="رمز عبور خود را وارد کنید"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'در حال پردازش...' : isSignUp ? 'ثبت نام' : 'ورود'}
          </button>
        </form>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              {isSignUp
                ? 'قبلاً ثبت نام کرده‌اید؟ ورود'
                : 'حساب کاربری ندارید؟ ثبت نام'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">در حال بارگذاری...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}