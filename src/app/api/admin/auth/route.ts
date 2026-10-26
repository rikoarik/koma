import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Fail-closed: Never allow authentication if ADMIN_PASSWORD is not configured
    if (!adminPassword || typeof adminPassword !== 'string' || adminPassword.trim() === '') {
      console.error('[SECURITY FATAL] ADMIN_PASSWORD environment variable is NOT set on server.');
      return NextResponse.json(
        {
          success: false,
          error: 'Konfigurasi server bermasalah: Variabel lingkungan ADMIN_PASSWORD belum diatur di server.',
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string' || password !== adminPassword) {
      return NextResponse.json({ success: false, error: 'Kata sandi admin salah.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: 'Autentikasi admin berhasil.' });
    response.cookies.set('koma_admin_auth', adminPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Gagal memproses autentikasi.' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil.' });
  response.cookies.delete('koma_admin_auth');
  return response;
}
