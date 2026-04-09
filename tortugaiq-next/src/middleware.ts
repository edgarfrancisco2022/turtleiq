import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAppRoute = req.nextUrl.pathname.startsWith('/app')

  if (isAppRoute && !isLoggedIn) {
    const signInUrl = new URL('/sign-in', req.nextUrl.origin)
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/app/:path*'],
}
