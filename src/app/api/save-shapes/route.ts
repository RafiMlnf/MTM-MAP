import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Generate date string in YYYY-MM-DD format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const filename = `mtm-${dateStr}.json`;
    const rootDir = process.cwd();
    const filePath = path.join(rootDir, filename);
    const publicShapesPath = path.join(rootDir, 'public', 'shapes.json');

    const jsonString = JSON.stringify(data, null, 2);

    // Save to the root project folder
    fs.writeFileSync(filePath, jsonString, 'utf8');

    // Also overwrite public/shapes.json to keep client app in sync
    fs.writeFileSync(publicShapesPath, jsonString, 'utf8');

    return NextResponse.json({
      success: true,
      filename,
      filePath
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
