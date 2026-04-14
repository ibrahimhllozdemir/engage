import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { drive, FOLDER_ID } from '@/lib/drive';

export async function POST(request) {
  try {
    const { name, mimeType } = await request.json();

    if (!name || !mimeType) {
      return NextResponse.json({ error: 'Eksik alan: name ve mimeType gerekli' }, { status: 400 });
    }

    // Google API Client'ını kullanarak raw Access Token alıyoruz.
    // Bu sayede tarayıcının doğrudan yükleme yapabileceği (Resumable) URL'yi fetch edebileceğiz.
    const authClient = await drive.context._options.auth.getClient();
    const { token } = await authClient.getAccessToken();

    const userOrigin = request.headers.get('origin') || '*';

    // 1. Adım: Resumable Upload oturumu başlat
    const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': mimeType,
        'Origin': userOrigin
      },
      body: JSON.stringify({
        name,
        parents: [FOLDER_ID]
      })
    });

    if (!initRes.ok) {
      const errText = await initRes.text();
      console.error('Google init error:', errText);
      return NextResponse.json({ error: 'Google Drive bağlantısı kurulamadı.' }, { status: initRes.status });
    }

    // 2. Adım: Google'ın verdiği tek kullanımlık yükleme URL'sini (Location = Bilet) al
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
