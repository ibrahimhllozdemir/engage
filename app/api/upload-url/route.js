import { NextResponse } from 'next/server';
import { auth, FOLDER_ID } from '@/lib/drive';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, mimeType, origin: clientOrigin } = body;

    if (!name || !mimeType) {
      return NextResponse.json({ error: 'Eksik alan: name ve mimeType gerekli' }, { status: 400 });
    }

    // Auth token al — doğrudan export edilen auth objesinden
    const client = await auth.getClient();
    const { token } = await client.getAccessToken();

    // Origin: önce client'ın gönderdiğini kullan, yoksa header'dan al, yoksa host'tan türet
    const userOrigin =
      clientOrigin ||
      request.headers.get('origin') ||
      (() => {
        const host = request.headers.get('host');
        const proto = request.headers.get('x-forwarded-proto') || 'https';
        return host ? `${proto}://${host}` : null;
      })();

    const initHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Upload-Content-Type': mimeType,
    };
    if (userOrigin) initHeaders['Origin'] = userOrigin;

    // Google Drive'dan tek kullanımlık Resumable Upload URL'si iste
    const initRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
      {
        method: 'POST',
        headers: initHeaders,
        body: JSON.stringify({ name, parents: [FOLDER_ID] }),
      }
    );

    if (!initRes.ok) {
      const errText = await initRes.text();
      console.error('Google init error:', errText);
      return NextResponse.json({ error: 'Google Drive bağlantısı kurulamadı.' }, { status: initRes.status });
    }

    const uploadUrl = initRes.headers.get('location');
    if (!uploadUrl) {
      return NextResponse.json({ error: 'Upload URL oluşturulamadı.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, uploadUrl });
  } catch (err) {
    console.error('Upload URL error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
