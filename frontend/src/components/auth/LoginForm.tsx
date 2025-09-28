'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import Navbar from '@/components/shared/Navbar'
import '@/styles/auth.css'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signUp, isLoading, error, clearError } = useAuth()

  const [isLogin, setIsLogin] = useState(false)
  const [inputType, setInputType] = useState<'email' | 'phone'>('email')
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    name: '',
    verificationCode: ''
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 获取重定向URL参数，确保searchParams不为null
  const redirectUrl = searchParams?.get('redirect') || '/chat'

  // 修复hydration错误 - 确保组件已挂载
  useEffect(() => {
    setMounted(true)
  }, [])

  // 修复倒计时逻辑 - 使用useEffect管理定时器
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsCodeSent(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    // 清理定时器，防止内存泄漏
    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [countdown])

  // 组件卸载时清理状态
  useEffect(() => {
    return () => {
      if (countdown > 0) {
        setCountdown(0)
        setIsCodeSent(false)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLogin && !agreedToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }

    // 表单验证
    if (!formData.email && !formData.phone) {
      alert('Please enter email or phone number')
      return
    }

    if (!formData.password) {
      alert('Please enter password')
      return
    }

    // 密码强度验证（注册时）
    if (!isLogin) {
      if (formData.password.length < 8) {
        alert('Password must be at least 8 characters long')
        return
      }
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
      if (!passwordRegex.test(formData.password)) {
        alert('Password must include numbers, letters, and symbols (min 8 characters)')
        return
      }
    }

    // 清除之前的错误
    clearError()

    try {
      if (isLogin) {
        // 登录逻辑
        await signIn({
          email: formData.email,
          password: formData.password,
        })
        // 登录成功，直接跳转，不显示弹出提示
        router.push(redirectUrl)
      } else {
        // 注册逻辑
        const emailOrPhone = inputType === 'email' ? formData.email : formData.phone

        // 手机号注册时验证验证码
        if (inputType === 'phone' && !formData.verificationCode) {
          alert('Please enter verification code')
          return
        }

        await signUp({
          email: emailOrPhone,
          name: formData.name || 'User',
          password: formData.password,
          // 只在 inputType 为 phone 时传递 verificationCode，避免类型错误
          ...(inputType === 'phone' && { verificationCode: formData.verificationCode })
        })
        // 注册成功，直接跳转，不显示弹出提示
        router.push(redirectUrl)
      }
    } catch (error) {
      console.error('Auth error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      alert(errorMessage)
    }
  }

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const sendVerificationCode = async () => {
    if (!formData.phone) {
      alert('Please enter a phone number first')
      return
    }

    // 手机号格式验证
    const phoneRegex = /^[1-9]\d{10}$/
    if (!phoneRegex.test(formData.phone)) {
      alert('Please enter a valid phone number')
      return
    }

    if (isCodeSent && countdown > 0) {
      return
    }

    try {
      // 调用API发送验证码
      // await api.sendVerificationCode(formData.phone)

      setIsCodeSent(true)
      setCountdown(60)
      alert('Verification code sent!')
    } catch (error) {
      console.error('Send code error:', error)
      alert('Failed to send verification code')
    }
  }

  // 切换登录/注册模式时重置表单
  const toggleMode = useCallback(() => {
    setIsLogin(prev => !prev)
    setFormData({
      email: '',
      phone: '',
      password: '',
      name: '',
      verificationCode: ''
    })
    setAgreedToTerms(false)
    if (countdown > 0) {
      setCountdown(0)
      setIsCodeSent(false)
    }
  }, [countdown])

  return (
    <div className="min-h-screen relative auth-page-background">
      {/* 背景图片颜色覆盖层 */}
      <div className="absolute inset-0 auth-background-overlay"></div>
      
      {/* 顶部导航 */}
      <div className="relative z-10">
        <Navbar />
      </div>

      <div className="flex min-h-[calc(100vh-100px)] w-full relative z-30 lg:flex-row flex-col">
        {/* 左侧内容区 - 向右移动，减少左侧边距，增加右侧边距 */}
        <div className="lg:w-3/5 w-full px-4 lg:px-12 lg:pr-16 pb-8 relative flex flex-col justify-center auth-left-content">
          {/* 背景装饰圆圈 */}
          <div className="absolute top-20 left-16 w-24 h-24 bg-white/10 rounded-full hidden lg:block"></div>
          <div className="absolute top-1/4 right-20 w-16 h-16 bg-white/15 rounded-full hidden lg:block"></div>
          <div className="absolute bottom-20 right-16 w-20 h-20 bg-white/10 rounded-full hidden lg:block"></div>
          <div className="absolute bottom-1/3 left-20 w-12 h-12 bg-white/15 rounded-full hidden lg:block"></div>

          {/* AI认证插图 - 调整边距和定位 */}
          <div className="flex justify-center mb-4 max-w-xl lg:max-w-2xl mx-auto auth-illustration-container">
            <div className="w-[200px] h-[180px] lg:w-[320px] lg:h-[280px]">
              <img
                src="/images/icon-auth.png"
                alt="AI Authentication"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>

          {/* 文字内容 - 调整对齐方式和边距 */}
          <div className="text-center space-y-3 max-w-xl lg:max-w-2xl mx-auto mt-8 auth-text-content">
            <h1 className="text-xl lg:text-2xl font-bold text-black leading-tight">
              AI-Powered All-in-One Application Service
            </h1>
            <p className="text-gray-700 text-xs lg:text-sm leading-relaxed">
              Creating your profile, selecting schools, and planning application
              to writing essays, managing documents, and submission
            </p>
          </div>
        </div>

        {/* 右侧表单区 - 向右移动，增加左侧边距 */}
        <div className="lg:w-2/5 w-full py-8 lg:py-0 auth-form-wrapper">
          <div className="auth-form-container-wrapper">
            {/* 外部标题 */}
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 text-right">
              {isLogin ? 'Log in' : 'SIGN UP NOW'}
            </h2>
            <div className="bg-white shadow-2xl rounded-lg relative">
              {/* 问号图标 - 左上角 */}
              <div className="absolute -top-28 -left-0 w-30 h-30 z-20">
                <img
                  src="/images/icon-question.png"
                  alt="Question Icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="login-header-container">
                <div className="login-header-right">
                  <button
                    onClick={toggleMode}
                    className="login-toggle-btn text-sm cursor-pointer font-medium transition-colors"
                  >
                    {isLogin ? 'Need an account? Sign up >' : 'Log in >'}
                  </button>
                </div>
              </div>

              {/* 邮箱/手机号切换 - 登录和注册都显示 */}
              <div className="flex email-tab-container mb-6 px-8">
                <button
                  type="button"
                  onClick={() => setInputType('email')}
                  className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                    inputType === 'email'
                      ? 'email-tab-active'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Email
                </button>
{/* 暂时注释掉手机号注册入口 */}
                </div>

              <div className="auth-form-container">
                <form onSubmit={handleSubmit}>

                  {/* 邮箱字段 */}
                  {!isLogin && inputType === 'email' && (
                    <div className="auth-form-group">
                      <input
                        name="email"
                        type="email"
                        placeholder="请输入邮箱"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="auth-form-input"
                      />
                    </div>
                  )}

                  {/* 手机号字段 - 暂时注释掉
                  {!isLogin && inputType === 'phone' && (
                    <>
                      <div className="auth-form-group">
                        <input
                          name="phone"
                          type="tel"
                          placeholder="请输入手机号码"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          maxLength={11}
                          className="auth-form-input"
                        />
                      </div>
                      <div className="verification-container">
                        <div className="verification-row">
                          <input
                            name="verificationCode"
                            type="text"
                            placeholder="请输入验证码"
                            value={formData.verificationCode}
                            onChange={handleChange}
                            required
                            maxLength={6}
                            className="verification-input"
                          />
                          <button
                            type="button"
                            onClick={sendVerificationCode}
                            disabled={isCodeSent && countdown > 0}
                            className="verification-btn"
                          >
                            {isCodeSent && countdown > 0 ? `${countdown}s` : '获取验证码'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  */}

                  {/* 登录时的邮箱字段 */}
                  {isLogin && (
                    <div className="auth-form-group">
                      <input
                        name="email"
                        type="email"
                        placeholder="请输入邮箱地址"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="auth-form-input"
                      />
                    </div>
                  )}

                  {/* 密码字段 */}
                  <div className="auth-form-group">
                    <div className="password-input-container">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="请输入密码"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        className="auth-form-input password-input"
                      />
                      <div
                        className="password-eye-icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </div>
                    </div>
                    {!isLogin && (
                      <div className="password-hint">
                        密码必须包含数字、字母和符号（至少8位字符）
                      </div>
                    )}
                  </div>

                  {/* 协议条款 */}
                  {!isLogin && (
                    <div className="terms-container">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        required
                        className="terms-checkbox"
                      />
                      <label htmlFor="terms" className="terms-label">
                        我已阅读并同意{' '}
                        <a href="/privacy" className="terms-link" target="_blank">
                          《隐私政策》
                        </a>{' '}
                        和{' '}
                        <a href="/terms" className="terms-link" target="_blank">
                          《用户协议》
                        </a>
                      </label>
                    </div>
                  )}

                  {/* 提交按钮 */}
                  <button
                    type="submit"
                    disabled={mounted ? isLoading : false}
                    className="auth-submit-btn"
                  >
                    {mounted && isLoading ? '请稍候...' : (isLogin ? '立即登录' : '立即注册')}
                  </button>

                  {/* 错误提示 */}
                  {error && (
                    <div className="auth-error-message">
                      {error}
                    </div>
                  )}
                </form>
              </div>

              {/* 社交媒体登录 - 暂时注释掉
              <div className="social-login-container">
                <div className="social-login-text">Sign up with social media</div>
                <div className="social-login-buttons">
                  <button
                    type="button"
                    className="social-login-btn"
                    aria-label="Sign up with WeChat"
                  >
                    <img
                      src="/images/icon-WeChat.png"
                      alt="WeChat"
                    />
                  </button>
                  <button
                    type="button"
                    className="social-login-btn"
                    aria-label="Sign up with QQ"
                  >
                    <img
                      src="/images/icon-qq.png"
                      alt="QQ"
                    />
                  </button>
                </div>
              </div>
              */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}