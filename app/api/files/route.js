import { NextResponse } from 'next/server';
import { drive, FOLDER_ID } from '@/lib/drive';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`,
      fields: 'files(id, name, mimeType, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = (res.data.files || []).map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      isVideo: file.mimeType?.startsWith('video/'),
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`,
      imageUrl: `https://lh3.googleusercontent.com/d/${file.id}`,
      previewUrl: `https://drive.google.com/file/d/${file.id}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
    }));

    return NextResponse.json({ files });
  } catch (err) {
    console.error('Files list error:', err);
    return NextResponse.json({ files: [], error: err.message }, { status: 500 });
  }
}
