import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="font-serif text-4xl font-bold text-pearl mb-1">
            Focus <span className="text-gold italic font-light">3D</span>
          </div>
          <div className="font-mono text-[10px] tracking-[4px] uppercase text-ash mt-2">
            Panel de administración
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
