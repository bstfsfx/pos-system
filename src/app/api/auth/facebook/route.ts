import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

// Facebook OAuth - Start or Callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      // Step 1: Redirect to Facebook OAuth
      const clientId = process.env.FACEBOOK_APP_ID
      const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook`
      
      const scopes = ['public_profile', 'email'].join(',')
      
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `state=member_login`

      return NextResponse.redirect(authUrl)
    }

    // Step 2: Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${process.env.FACEBOOK_APP_ID}&` +
      `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
      `redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook`)}&` +
      `code=${code}`

    const tokenRes = await fetch(tokenUrl)
    const tokens = await tokenRes.json()

    if (!tokens.access_token) {
      return NextResponse.redirect(new URL('/?error=facebook_failed'))
    }

    // Step 3: Get user profile with email
    const userInfoUrl = `https://graph.facebook.com/me?` +
      `fields=id,name,picture,email&` +
      `access_token=${tokens.access_token}`
    
    const userInfoRes = await fetch(userInfoUrl)
    const userInfo = await userInfoRes.json()

    // Step 4: Find or create member
    let member = await prisma.member.findFirst({
      where: { provider: 'facebook', providerId: userInfo.id },
    })

    if (!member) {
      member = await prisma.member.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture?.data?.url,
          provider: 'facebook',
          providerId: userInfo.id,
        },
      })
    }

    // Step 5: Generate session token
    const sessionToken = jwt.sign(
      { memberId: member.id, email: member.email, provider: 'facebook', type: 'member' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    )

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/member?token=${sessionToken}&provider=facebook`
    )
  } catch (error) {
    console.error('Facebook OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=server'))
  }
}