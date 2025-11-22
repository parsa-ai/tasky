'use client'

import { type User } from '@supabase/supabase-js'

export default function AccountForm({ user }: { user: User | null }) {
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.display_name || 'نامشخص'
  const email = user?.email || 'ایمیل ثبت نشده'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            پروفایل
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            اطلاعات حساب کاربری شما
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              نام
            </label>
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              {fullName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ایمیل
            </label>
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              {email}
            </div>
          </div>

          <form action="/auth/signout" method="post" className="pt-4">
            <button
              type="submit"
              className="w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              خروج
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}