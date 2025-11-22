'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export type ActionResult = {
  success: boolean
  message?: string
  redirect?: string
}

export async function login(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = formData.get('next') as string

  // اعتبارسنجی ورودی‌ها
  if (!email || !password) {
    return { success: false, message: 'لطفاً ایمیل و رمز عبور را وارد کنید' }
  }

  const trimmedEmail = email.trim().toLowerCase()

  // بررسی فرمت ایمیل
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return { success: false, message: 'فرمت ایمیل معتبر نیست' }
  }

  // بررسی طول رمز عبور
  if (password.length < 6) {
    return { success: false, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }
  }

  // تلاش برای ورود
  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  })

  // اگر خطا وجود داشت
  if (error) {
    const errorMessage = error.message.toLowerCase()
    
    // بررسی خطای ایمیل تایید نشده - این مهمترین بررسی است
    if (errorMessage.includes('email not confirmed') || 
        errorMessage.includes('email_not_confirmed') ||
        errorMessage.includes('email_not_verified') ||
        errorMessage.includes('email confirmation')) {
      return { success: false, message: 'لطفاً ابتدا ایمیل خود را تایید کنید. لینک تایید به ایمیل شما ارسال شده است.' }
    }

    // بررسی خطای اعتبارسنجی
    if (errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('invalid_credentials') ||
        errorMessage.includes('invalid password') ||
        errorMessage.includes('wrong password')) {
      return { success: false, message: 'ایمیل یا رمز عبور اشتباه است' }
    }

    if (error.message.includes('Email rate limit exceeded')) {
      return { success: false, message: 'تعداد درخواست‌های ورود بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید.' }
    }

    if (error.message.includes('Too many requests')) {
      return { success: false, message: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید.' }
    }

    // خطای پیش‌فرض
    return { success: false, message: 'خطا در ورود. لطفاً دوباره تلاش کنید.' }
  }

  // بررسی اینکه آیا ایمیل تایید شده است (بعد از موفقیت‌آمیز بودن ورود)
  // این حالت زمانی رخ می‌دهد که Supabase اجازه ورود با ایمیل تایید نشده را بدهد
  if (data?.user && !data.user.email_confirmed_at) {
    await supabase.auth.signOut()
    return { success: false, message: 'لطفاً ابتدا ایمیل خود را تایید کنید. لینک تایید به ایمیل شما ارسال شده است.' }
  }

  revalidatePath('/', 'layout')
  return { success: true, redirect: next || '/' }
}

export async function signup(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const fullname = formData.get('fullname') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // اعتبارسنجی ورودی‌ها
  if (!fullname || !email || !password) {
    return { success: false, message: 'لطفاً تمام فیلدها را پر کنید' }
  }

  const trimmedEmail = email.trim().toLowerCase()
  const trimmedFullname = fullname.trim()

  // بررسی طول نام
  if (trimmedFullname.length < 2) {
    return { success: false, message: 'نام باید حداقل ۲ کاراکتر باشد' }
  }

  if (trimmedFullname.length > 100) {
    return { success: false, message: 'نام نمی‌تواند بیش از ۱۰۰ کاراکتر باشد' }
  }

  // بررسی فرمت ایمیل
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return { success: false, message: 'فرمت ایمیل معتبر نیست' }
  }

  // بررسی طول رمز عبور
  if (password.length < 6) {
    return { success: false, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }
  }

  if (password.length > 72) {
    return { success: false, message: 'رمز عبور نمی‌تواند بیش از ۷۲ کاراکتر باشد' }
  }

  // ثبت نام
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: {
        full_name: trimmedFullname,
        display_name: trimmedFullname,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`,
    },
  })

  if (signUpError) {
    // مدیریت خطاهای مختلف
    const errorMessage = signUpError.message.toLowerCase()
    if (errorMessage.includes('already registered') || 
        errorMessage.includes('already exists') ||
        errorMessage.includes('user already registered') ||
        errorMessage.includes('email address is already registered')) {
      return { success: false, message: 'این ایمیل قبلاً ثبت شده است. لطفاً وارد شوید.' }
    }

    if (signUpError.message.includes('Password should be at least')) {
      return { success: false, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }
    }

    if (signUpError.message.includes('Invalid email')) {
      return { success: false, message: 'فرمت ایمیل معتبر نیست' }
    }

    if (signUpError.message.includes('Email rate limit exceeded')) {
      return { success: false, message: 'تعداد درخواست‌های ثبت نام بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید.' }
    }

    if (signUpError.message.includes('Signup is disabled')) {
      return { success: false, message: 'ثبت نام در حال حاضر غیرفعال است.' }
    }

    // خطای پیش‌فرض
    return { success: false, message: 'خطا در ثبت نام. لطفاً دوباره تلاش کنید.' }
  }

  // بررسی اینکه آیا ایمیل تایید نیاز است
  // Supabase همیشه user را برمی‌گرداند حتی اگر ایمیل تایید نشده باشد
  if (signUpData.user) {
    revalidatePath('/', 'layout')
    // اگر ایمیل تایید نشده باشد، پیام success نمایش می‌دهیم
    if (!signUpData.user.email_confirmed_at) {
      return { success: true, message: 'ثبت نام با موفقیت انجام شد. لطفاً ایمیل خود را تایید کنید. لینک تایید به ایمیل شما ارسال شده است.' }
    }
    // اگر ایمیل تایید شده باشد (در صورت غیرفعال بودن تایید ایمیل در Supabase)
    return { success: true, redirect: '/' }
  }

  revalidatePath('/', 'layout')
  return { success: true, redirect: '/' }
}