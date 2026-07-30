import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { stringifyMtm } from '../../../utils/mtmFormat';

/** Strip base64 imageUrls from shapes so they don't bloat the project file.
 *  Path-based imageUrls (starting with "/") are kept as-is.
 */
function stripBase64Images(data: any): any {
  if (!data || typeof data !== 'object') return data;

  // Strip mainGate base64 image
  if (data.mainGate && data.mainGate.imageUrl && data.mainGate.imageUrl.startsWith('data:')) {
    data.mainGate = { ...data.mainGate };
    delete data.mainGate.imageUrl;
  }

  // Strip shape base64 images
  if (Array.isArray(data.shapes)) {
    data.shapes = data.shapes.map((shape: any) => {
      if (shape.imageUrl && shape.imageUrl.startsWith('data:')) {
        const { imageUrl: _removed, ...rest } = shape;
        return rest;
      }
      return shape;
    });
  }

  return data;
}

export async function POST(request: Request) {
  try {
    const rawData = await request.json();

    // Strip base64 images — they should be stored via /api/save-image as files
    const data = stripBase64Images(rawData);

    // Add saved timestamp
    data.savedAt = new Date().toISOString();

    const rootDir = process.cwd();
    const publicMtmPath = path.join(rootDir, 'public', 'map.mtm');
    const publicShapesPath = path.join(rootDir, 'public', 'shapes.json');

    // 1. Convert to MTM format string
    const mtmString = stringifyMtm(data);

    // 2. Save .mtm to public/map.mtm — the single source of truth
    fs.writeFileSync(publicMtmPath, mtmString, 'utf8');

    // 3. Compile public/shapes.json for Next.js static imports compatibility
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(publicShapesPath, jsonString, 'utf8');

    // 4. Save a dated backup copy of the .mtm project file in the root project folder
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const filename = `map-${dateStr}.mtm`;
    const backupPath = path.join(rootDir, filename);
    fs.writeFileSync(backupPath, mtmString, 'utf8');

    return NextResponse.json({
      success: true,
      savedAt: data.savedAt,
      shapeCount: Array.isArray(data.shapes) ? data.shapes.length : 0,
      filename,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
