import { NextResponse } from 'next/server';
import { drive, FOLDER_ID } from '@/lib/drive';
import { Readable } from 'stream';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, mimeType, data } = body;

    if (!data || !name || !mimeType) {
      return NextResponse.json({ error: 'Eksik alan: name, mimeType, data gerekli' }, { status: 400 });
    }

    // Base64 → Buffer → Readable stream
    const buffer = Buffer.from(data, 'base64');
    const stream = Readable.from(buffer);

    const driveRes = await drive.files.create({
      requestBody: {
        name,
        parents: [FOLDER_ID],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, name',
      supportsAllDrives: true,
    });

    const fileId = driveRes.data.id;

    // Herkese açık yap (galeri için)
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });

    return NextResponse.json({ success: true, fileId });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
