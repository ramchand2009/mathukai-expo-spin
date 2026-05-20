import { NextRequest, NextResponse } from 'next/server'

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Spin Wheel Dashboard"',
    },
  })
}

function isProtectedRequest(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard')) return true
  if (pathname.startsWith('/api/entries')) return true
  if (pathname.startsWith('/api/offers') && request.method !== 'GET') return true

  return false
}

export function middleware(request: NextRequest) {
  if (!isProtectedRequest(request)) {
    return NextResponse.next()
  }

  const password = process.env.DASHBOARD_PASSWORD

  if (!password) {
    return NextResponse.next()
  }

  const username = process.env.DASHBOARD_USERNAME || 'admin'
  const authorization = request.headers.get('authorization')

  if (!authorization?.startsWith('Basic ')) {
    return unauthorized()
  }

  const encodedCredentials = authorization.slice('Basic '.length)
  const [providedUsername, providedPassword] = atob(encodedCredentials).split(':')

  if (providedUsername !== username || providedPassword !== password) {
    return unauthorized()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/entries/:path*', '/api/offers/:path*'],
}
