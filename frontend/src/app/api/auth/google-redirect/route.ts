import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  console.log('Google redirect called, received code:', code?.substring(0, 10) + '...');
  
  if (!code) {
    console.error('No authorization code received from Google');
    return NextResponse.redirect(new URL('/login?error=No%20authorization%20code%20received', request.url));
  }
  
  try {
    // Exchange code for token
    console.log('Sending code to backend for token exchange');
    
    // Use environment variable for backend URL, fallback to localhost for local development
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:8000';
    const fullBackendUrl = `${backendUrl}/api/auth/google-login`;
    console.log('Backend URL:', fullBackendUrl);
    
    // Log the request we're about to make
    console.log('Request payload:', { token: code });
    
    const tokenResponse = await fetch(fullBackendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: code }),
    });
    
    const responseStatus = tokenResponse.status;
    console.log('Response status:', responseStatus);
    
    if (!tokenResponse.ok) {
      // Try to get response text, but handle cases where it might not be available
      let errorText = '';
      try {
        errorText = await tokenResponse.text();
      } catch (e) {
        errorText = 'Unable to get error details';
      }
      
      console.error('Error exchanging code for token. Status:', responseStatus);
      console.error('Error details:', errorText);
      return NextResponse.redirect(new URL(`/login?error=Authentication%20failed&details=${encodeURIComponent(errorText)}`, request.url));
    }
    
    console.log('Successfully received token from backend');
    const tokenData = await tokenResponse.json();
    
    // For debugging
    console.log('Token data received:', tokenData);
    
    // HTML with script to store token in localStorage, set cookies, and redirect
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <script>
            console.log('Setting authentication data...');
            
            // Store token in localStorage
            localStorage.setItem('auth_token', '${tokenData.access_token}');
            
            // Set cookie for client-side detection
            document.cookie = 'isAuthenticated=true; path=/; max-age=' + (60 * 60 * 24 * 7); // 1 week
            
            // Clear any existing cache by adding timestamp
            const timestamp = new Date().getTime();
            
            console.log('Authentication data set, redirecting...');
            
            // Use window.location.replace to avoid caching issues
            window.location.replace('/?t=' + timestamp);
          </script>
        </head>
        <body>
          <h1>Authentication Successful</h1>
          <p>Redirecting to home page...</p>
          <noscript>
            <meta http-equiv="refresh" content="0; url=/" />
          </noscript>
        </body>
      </html>
    `;
    
    const response = new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        // Add cache control headers to prevent caching
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
    
    // Set cookies server-side as well
    response.headers.set('Set-Cookie', [
      `auth_token=${tokenData.access_token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`,
      `isAuthenticated=true; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
    ].join(', '));
    
    return response;
    
  } catch (error) {
    console.error('Error in Google redirect handler:', error);
    return NextResponse.redirect(new URL(`/login?error=Server%20error&details=${encodeURIComponent(String(error))}`, request.url));
  }
} 