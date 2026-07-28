import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

// Google OAuth - Start or Callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      // Step 1: Redirect to Google OAuth
      const clientId = process.env.GOOGLE_CLIENT_ID
      const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google`
      
      const scopes = ['profile', 'email'].join(' ')
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `state=member_login`

      return NextResponse.redirect(authUrl)
    }

    // Step 2: Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google`,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (!tokens.access_token) {
      return NextResponse.redirect(new URL('/?error=google_failed'))
    }

    // Step 3: Get user info
    const userInfoRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    )
    const userInfo = await userInfoRes.json()

    // Step 4: Find or create member
    let member = await prisma.member.findFirst({
      where: { provider: 'google', providerId: userInfo.id },
    })

    if (!member) {
      member = await prisma.member.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          provider: 'google',
          providerId: userInfo.id,
        },
      })
    }

    // Step 5: Generate session token
    const sessionToken = jwt.sign(
      { memberId: member.id, email: member.email, provider: 'google', type: 'member' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    )

    // Redirect to member page with token
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/member?token=${sessionToken}&provider=google`
    )
  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=server'))
  }
}