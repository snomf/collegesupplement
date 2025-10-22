import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    })

    if (error) {
      alert(error.error_description || error.message)
    } else {
      alert('Check your email for the login link!')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark text-text-dark-primary">
      <div className="w-full max-w-md p-8 space-y-8 bg-card-dark rounded-xl shadow-2xl">
        <div>
          <h2 className="text-center text-4xl font-black leading-tight tracking-[-0.033em]">
            Welcome
          </h2>
          <p className="mt-2 text-center text-sm text-text-dark-secondary">
            Sign in with a magic link. No password required.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-6">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email Address
              </label>
              <div className="flex flex-col">
                <p className="text-base font-medium leading-normal pb-2">Email Address</p>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-dark-secondary">
                    mail
                  </span>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full rounded-lg border border-border-dark bg-background-dark h-14 pl-12 pr-4 placeholder:text-text-dark-secondary focus:border-primary focus:ring-primary"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold rounded-lg text-slate-50 bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary h-12"
              disabled={loading}
            >
              {loading ? <span>Sending...</span> : <span>Send Magic Link</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
