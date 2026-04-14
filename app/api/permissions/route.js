import { NextResponse } from 'next/server';
import { drive } from '@/lib/drive';

export async function POST(request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'fileId gerekli' }, { status: 400 });
    }

    // Dosyayı herkesin görebileceği (okuyabileceği) şekilde ayarla
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Permission set error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
