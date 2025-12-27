import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminEditPage = req.nextUrl.pathname.startsWith('/admin/edit')

  // Protect admin/edit routes
  if (isAdminEditPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/edit/:path*'],
}
