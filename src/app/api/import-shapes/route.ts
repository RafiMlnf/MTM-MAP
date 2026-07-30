import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { stringifyMtm } from '../../../utils/mtmFormat';

// Function to safely evaluate JavaScript code string into an object
function evalCode(code: string) {
  const m = { exports: {} as any };
  const fn = new Function('module', 'exports', code);
  fn(m, m.exports);
  return m.exports;
}

export async function POST() {
  try {
    const rootDir = process.cwd();
    const testFilePath = path.join(rootDir, 'test.tsx');
    const shapes5Path = path.join(rootDir, 'mtm-shapes (5).json');
    const mtmPath = path.join(rootDir, 'public', 'map.mtm');
    const shapesJsonPath = path.join(rootDir, 'public', 'shapes.json');

    if (!fs.existsSync(testFilePath)) {
      return NextResponse.json(
        { success: false, error: 'File test.tsx tidak ditemukan di root project' },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(testFilePath, 'utf8');

    // Find sections
    const layersDivider = '// LAYERS CONFIG';
    const mainGateDivider = '// PINTU MASUK UTAMA';

    const layersIndex = content.indexOf(layersDivider);
    const mainGateIndex = content.indexOf(mainGateDivider);

    if (layersIndex === -1 || mainGateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Format test.tsx tidak valid' },
        { status: 400 }
      );
    }

    // Extract Shapes
    const shapesPart = content.substring(0, layersIndex);
    const shapesClean = shapesPart.replace(/\/\/ ═+[^]*?\/\/ ═+/g, '').trim();
    const shapesCode = `module.exports = [\n${shapesClean}\n];`;
    const shapes = evalCode(shapesCode);

    // Extract Layers
    const layersPart = content.substring(layersIndex, mainGateIndex);
    const layersStart = layersPart.indexOf('{');
    const layersEnd = layersPart.lastIndexOf(']') + 1;
    const layersClean = layersPart.substring(layersStart, layersEnd);
    const layersCode = `module.exports = [\n${layersClean};`;
    const layers = evalCode(layersCode);

    // Extract Main Gate
    const mainGatePart = content.substring(mainGateIndex);
    const mainGateStart = mainGatePart.indexOf('"x"');
    const mainGateEnd = mainGatePart.lastIndexOf('}') + 1;
    const mainGateClean = mainGatePart.substring(mainGateStart, mainGateEnd);
    const mainGateCode = `module.exports = {\n${mainGateClean};`;
    const mainGate = evalCode(mainGateCode);

    // Merge existing image files if shapes5 has them
    if (fs.existsSync(shapes5Path)) {
      try {
        const shapes5Data = JSON.parse(fs.readFileSync(shapes5Path, 'utf8'));
        const shapes5Array = Array.isArray(shapes5Data) ? shapes5Data : (shapes5Data.shapes || []);
        
        const imageMap = new Map<string, string>();
        shapes5Array.forEach((shape: any) => {
          if (shape.imageUrl) {
            if (shape.id) imageMap.set(shape.id, shape.imageUrl);
            if (shape.uuid) imageMap.set(shape.uuid, shape.imageUrl);
          }
        });

        // Apply imageUrl to shapes
        shapes.forEach((shape: any) => {
          const key = shape.id || shape.uuid;
          if (imageMap.has(key)) {
            // Point to the relative assets folder path
            const filename = key.replace(/[^a-zA-Z0-9_-]/g, '_') + '.jpg';
            shape.imageUrl = `/assets/map-thumb/${filename}`;
          }
        });

        // Apply imageUrl to mainGate
        if (mainGate) {
          mainGate.imageUrl = '/assets/map-thumb/main-gate.jpg';
        }
      } catch (e) {
        console.warn('Gagal melakukan migrasi gambar mtm-shapes (5):', e);
      }
    }

    const mapData = {
      layers,
      mainGate,
      shapes
    };

    // Save to map.mtm
    const mtmContent = stringifyMtm(mapData);
    fs.writeFileSync(mtmPath, mtmContent, 'utf8');

    // Save compiled shapes.json
    fs.writeFileSync(shapesJsonPath, JSON.stringify(mapData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Berhasil translate shapes dari test.tsx ke map.mtm',
      shapeCount: shapes.length,
      layerCount: layers.length,
      data: mapData
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
