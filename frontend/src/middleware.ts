import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add cache control headers to prevent caching issues with authentication
  if (request.nextUrl.pathname === '/' || 
      request.nextUrl.pathname.startsWith('/profile') ||
      request.nextUrl.pathname.startsWith('/settings') ||
      request.nextUrl.pathname.startsWith('/history')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  return response;
}

// Cấu hình matcher để chỉ áp dụng middleware cho một số đường dẫn cụ thể
export const config = {
  matcher: [
    // Match tất cả trừ các thư mục/file tĩnh phổ biến
    "/((?!api|_next/static|_next/image|favicon.ico|images/|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.png$|.*\\.gif$|.*\\.webp$|.*\\.ico$|.*\\.txt$|.*\\.xml$).*)",
  ],
}; 