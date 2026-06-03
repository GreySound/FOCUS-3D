import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/auth'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminAuthenticated())) {
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
