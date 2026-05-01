import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAppRoute = req.nextUrl.pathname.startsWith('/app')
  const isAuthRoute = req.nextUrl.pathname.startsWith('/sign-in') ||
    req.nextUrl.pathname.startsWith('/sign-up')

  if (isAppRoute && !isLoggedIn) {
    const signInUrl = new URL('/sign-in', req.nextUrl.origin)
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  const isGuest = req.auth?.user?.isGuest === true
  if (isAuthRoute && isLoggedIn && !isGuest) {
    return NextResponse.redirect(new URL('/app', req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/app/:path*', '/sign-in', '/sign-up'],
}
