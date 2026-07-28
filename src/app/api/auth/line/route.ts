import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

// LINE OAuth - Start or Callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      // Step 1: Redirect to LINE OAuth
      const clientId = process.env.LINE_CLIENT_ID
      const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/line`
      
      const authUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=profile%20email&` +
        `state=member_login`

      return NextResponse.redirect(authUrl)
    }

    // Step 2: Exchange code for tokens
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.LINE_CLIENT_ID}:${process.env.LINE_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/line`,
      }),
    })

    const tokens = await tokenRes.json()

    if (!tokens.access_token) {
      return NextResponse.redirect(new URL('/?error=line_failed'))
    }

    // Step 3: Get user profile
    const profileRes = await fetch(
      'https://api.line.me/v2/profile',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    )
    const profile = await profileRes.json()

    // Step 4: Get email (if scope includes email)
    let email = null
    if (tokens.id_token) {
      // Parse ID token to get email
      try {
        const idToken = tokens.id_token.split('.')[1]
        const decoded = Buffer.from(idToken, 'base64').toString()
        email = JSON.parse(decoded).email
      } catch (e) {}
    }

    // Step 5: Find or create member
    let member = await prisma.member.findFirst({
      where: { provider: 'line', providerId: profile.userId },
    })

    if (!member) {
      member = await prisma.member.create({
        data: {
          email,
          name: profile.displayName,
          picture: profile.pictureUrl,
          provider: 'line',
          providerId: profile.userId,
        },
      })
    }

    // Step 6: Generate session token
    const sessionToken = jwt.sign(
      { memberId: member.id, email: member.email, provider: 'line', type: 'member' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    )

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/member?token=${sessionToken}&provider=line`
    )
  } catch (error) {
    console.error('LINE OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=server'))
  }
}