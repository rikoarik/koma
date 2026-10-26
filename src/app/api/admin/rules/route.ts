import { NextRequest, NextResponse } from 'next/server';
import { getModerationRules, addModerationRule, deleteModerationRule } from '@/lib/storage';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { moderationRuleInput } from '@/lib/moderation-rule-input';

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
    }

    const rules = await getModerationRules();
    return NextResponse.json({ success: true, ...rules });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat aturan moderasi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
    }

    const parsed = moderationRuleInput.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Aturan tidak valid.' }, { status: 400 });
    }
    const newRule = await addModerationRule(parsed.data);

    return NextResponse.json({ success: true, rule: newRule });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menambahkan aturan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
    }

    const idFromQuery = request.nextUrl.searchParams.get('id');
    let ruleId = idFromQuery;
    if (!ruleId) {
      try {
        const body = await request.json();
        ruleId = body.ruleId;
      } catch {}
    }

    if (!ruleId) {
      return NextResponse.json({ success: false, error: 'ID aturan diperlukan' }, { status: 400 });
    }

    const ok = await deleteModerationRule(ruleId);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Aturan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Aturan berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghapus aturan' },
      { status: 500 }
    );
  }
}
