"use client"
import './globals.css'
export const metadata = {
  title: 'Delivery App',
  description: 'Made by Mohammad Tavakoli',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className='overflow-x-hidden'>
        {children}
      </body>
    </html>
  )
}
