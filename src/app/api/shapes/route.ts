import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseMtm, stringifyMtm } from '../../../utils/mtmFormat';

export async function GET() {
  try {
    const rootDir = process.cwd();
    const mtmPath = path.join(rootDir, 'public', 'map.mtm');
    const jsonPath = path.join(rootDir, 'public', 'shapes.json');

    // 1. Primary Source of Truth: public/map.mtm
    if (fs.existsSync(mtmPath)) {
      const mtmContent = fs.readFileSync(mtmPath, 'utf8');
      const data = parseMtm(mtmContent);
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    // 2. Legacy fallback & auto-conversion bootstrap
    if (fs.existsSync(jsonPath)) {
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      const data = JSON.parse(jsonContent);
      
      // Auto-bootstrap map.mtm
      const mtmContent = stringifyMtm(data);
      fs.writeFileSync(mtmPath, mtmContent, 'utf8');
      
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    // 3. Fallback for completely empty project
    return NextResponse.json({ layers: [], mainGate: null, shapes: [] }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
