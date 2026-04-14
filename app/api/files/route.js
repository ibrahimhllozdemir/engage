import { NextResponse } from 'next/server';
import { drive, FOLDER_ID } from '@/lib/drive';

export async function GET() {
  try {
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = (res.data.files || []).map((file) => ({
      id: file.id,
      name: file.name,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`,
      url: `https://lh3.googleusercontent.com/d/${file.id}`,
    }));

    return NextResponse.json({ files });
  } catch (err) {
    console.error('Files list error:', err);
    return NextResponse.json({ files: [], error: err.message }, { status: 500 });
  }
}
