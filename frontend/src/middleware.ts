import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Cấu hình matcher để chỉ áp dụng middleware cho một số đường dẫn cụ thể
export const config = {
  matcher: [
    // Match tất cả trừ các thư mục/file tĩnh phổ biến
    "/((?!api|_next/static|_next/image|favicon.ico|images/|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.png$|.*\\.gif$|.*\\.webp$|.*\\.ico$|.*\\.txt$|.*\\.xml$).*)",
  ],
}; 