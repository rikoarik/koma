import { NextRequest, NextResponse } from 'next/server';
import { getDonationConfig, saveDonationConfig } from '@/lib/storage';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { donationInput } from '@/lib/donation-input';

export async function GET() {
  try {
    const config = await getDonationConfig();
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat pengaturan donasi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin verification (header or cookie)
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Akses tidak diizinkan.' }, { status: 401 });
    }

    const parsed = donationInput.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Pengaturan tidak valid.' }, { status: 400 });
    await saveDonationConfig(parsed.data);
    return NextResponse.json({ success: true, message: 'Pengaturan donasi berhasil disimpan.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menyimpan pengaturan donasi' },
      { status: 500 }
    );
  }
}
