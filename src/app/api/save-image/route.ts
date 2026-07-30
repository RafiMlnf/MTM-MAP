import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { shapeId, imageDataUrl } = await request.json();

    if (!shapeId || !imageDataUrl) {
      return NextResponse.json(
        { success: false, error: 'shapeId and imageDataUrl are required' },
        { status: 400 }
      );
    }

    // Strip the data URL prefix (e.g. data:image/jpeg;base64,)
    const commaIdx = imageDataUrl.indexOf(',');
    const header = commaIdx !== -1 ? imageDataUrl.substring(0, commaIdx) : '';
    const base64Data = commaIdx !== -1 ? imageDataUrl.substring(commaIdx + 1) : imageDataUrl;

    const ext = header.includes('png') ? 'png' : 'jpg';

    if (!base64Data) {
      return NextResponse.json(
        { success: false, error: 'Invalid image data URL format' },
        { status: 400 }
      );
    }

    // Sanitize shapeId to be a safe filename
    const safeId = shapeId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = safeId + '.' + ext;

    const shapesImgDir = path.join(process.cwd(), 'public', 'assets', 'map-thumb');
    if (!fs.existsSync(shapesImgDir)) {
      fs.mkdirSync(shapesImgDir, { recursive: true });
    }

    const filePath = path.join(shapesImgDir, filename);
    const imageBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, imageBuffer);

    const imagePath = '/assets/map-thumb/' + filename;

    return NextResponse.json({ success: true, imagePath });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
