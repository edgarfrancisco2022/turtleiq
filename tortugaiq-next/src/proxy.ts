import { auth } from '@/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAppPath = req.nextUrl.pathname.startsWith('/app')

  if (isAppPath && !isLoggedIn) {
    return Response.redirect(new URL('/sign-in', req.url))
  }
})

export const config = {
  matcher: ['/app/:path*'],
}
