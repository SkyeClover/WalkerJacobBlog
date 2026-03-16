import { NextRequest, NextResponse } from 'next/server'

const OURA_TOKEN_URL = 'https://api.ouraring.com/oauth/token'

/**
 * Oura OAuth callback: exchange `code` for tokens and redirect to the app
 * with tokens in the URL fragment (no server-side token storage).
 *
 * Required env: OURA_CLIENT_ID, OURA_CLIENT_SECRET, OURA_REDIRECT_URI
 * Optional env: OURA_RETURN_URL (default return URL if state is not provided)
 *
 * In Oura dashboard, set Redirect URI to: https://www.walkerjacob.com/oura/callback
 * (or your production URL). Your app sends users to Oura with state=<returnUrl>
 * so after auth they are sent back to the right place.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // typically the app URL to return to
  const error = searchParams.get('error')

  const clientId = process.env.OURA_CLIENT_ID
  const clientSecret = process.env.OURA_CLIENT_SECRET
  const redirectUri = process.env.OURA_REDIRECT_URI
  const defaultReturnUrl = process.env.OURA_RETURN_URL || 'https://www.walkerjacob.com'

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Oura callback: missing OURA_CLIENT_ID, OURA_CLIENT_SECRET, or OURA_REDIRECT_URI')
    return NextResponse.redirect(
      new URL(
        `${defaultReturnUrl}#error=oauth_config&error_description=callback_not_configured`,
        defaultReturnUrl
      ),
      302
    )
  }

  if (error === 'access_denied') {
    const returnUrl = state || defaultReturnUrl
    return NextResponse.redirect(new URL(`${returnUrl}#error=access_denied`, returnUrl), 302)
  }

  if (!code) {
    const returnUrl = state || defaultReturnUrl
    return NextResponse.redirect(
      new URL(`${returnUrl}#error=missing_code&error_description=no_authorization_code`, returnUrl),
      302
    )
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    })

    const tokenRes = await fetch(OURA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!tokenRes.ok) {
      const text = await tokenRes.text()
      console.error('Oura token exchange failed', tokenRes.status, text)
      const returnUrl = state || defaultReturnUrl
      return NextResponse.redirect(
        new URL(
          `${returnUrl}#error=token_exchange_failed&error_description=${encodeURIComponent(text)}`,
          returnUrl
        ),
        302
      )
    }

    const data = (await tokenRes.json()) as {
      access_token: string
      refresh_token?: string
      expires_in?: number
      token_type?: string
    }

    const returnUrl = state || defaultReturnUrl
    const hash = new URLSearchParams({
      access_token: data.access_token,
      ...(data.refresh_token && { refresh_token: data.refresh_token }),
      ...(data.expires_in != null && { expires_in: String(data.expires_in) }),
    }).toString()

    return NextResponse.redirect(new URL(`${returnUrl}#${hash}`, returnUrl), 302)
  } catch (err) {
    console.error('Oura callback error', err)
    const returnUrl = state || defaultReturnUrl
    return NextResponse.redirect(
      new URL(
        `${returnUrl}#error=server_error&error_description=${encodeURIComponent(String(err))}`,
        returnUrl
      ),
      302
    )
  }
}
