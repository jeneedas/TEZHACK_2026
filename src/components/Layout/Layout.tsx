import React from 'react'
import { Header } from '../Header/Header'
import { Sidebar } from '../Sidebar/Sidebar'

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-full flex-col bg-bg">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1600px] p-5">{children}</div>
        </main>
      </div>
    </div>
  )
}
