import { Sidebar } from './Sidebar'

export function Layout({ children }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <main className="h-full overflow-auto">
          <div className="p-6 pt-16 md:pt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

