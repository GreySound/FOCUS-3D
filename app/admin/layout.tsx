import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash } from 'crypto'
import AdminSidebar from './AdminSidebar'

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + 'focus3d_salt').digest('hex')
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const auth = cookieStore.get('admin_auth')
  const expectedToken = hashPassword(process.env.ADMIN_PASSWORD ?? '')

  if (!auth || auth.value !== expectedToken) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-carbon flex">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-10">
        {children}
      </main>
    </div>
  )
}
