/**
 * Stringifies map data (layers, mainGate, shapes) into a custom .mtm text format.
 */
export function stringifyMtm(data: { layers: any[]; mainGate: any; shapes: any[] }): string {
  let out = "MTM_MAP_VERSION 1.0\n\n";

  // Layers section
  out += "[layers]\n";
  if (Array.isArray(data.layers)) {
    data.layers.forEach(l => {
      out += `${l.id}|${l.name || ''}|${l.visible ?? true}|${l.expanded ?? true}|${l.category || ''}\n`;
    });
  }
  out += "\n";

  // Main Gate section
  out += "[maingate]\n";
  if (data.mainGate) {
    out += `x=${data.mainGate.x ?? ''}\n`;
    out += `y=${data.mainGate.y ?? ''}\n`;
    out += `rotation=${data.mainGate.rotation ?? ''}\n`;
    if (data.mainGate.imageUrl) {
      out += `imageUrl=${data.mainGate.imageUrl}\n`;
    }
  }
  out += "\n";

  // Shapes section
  out += "[shapes]\n";
  if (Array.isArray(data.shapes)) {
    data.shapes.forEach((s, idx) => {
      if (idx > 0) out += "---\n";
      for (const [key, value] of Object.entries(s)) {
        if (value === undefined || value === null) continue;
        if (key === 'points' && Array.isArray(value)) {
          // Properly stringify points array: [{x: 1, y: 2}] -> "1,2"
          out += `points=${value.map(p => `${p.x},${p.y}`).join(' ')}\n`;
        } else if (typeof value === 'object') {
          out += `${key}=${JSON.stringify(value)}\n`;
        } else {
          out += `${key}=${value}\n`;
        }
      }
    });
  }

  return out;
}

/**
 * Parses a custom .mtm text file back into map data (layers, mainGate, shapes).
 */
export function parseMtm(content: string): { layers: any[]; mainGate: any; shapes: any[] } {
  const result = {
    layers: [] as any[],
    mainGate: null as any,
    shapes: [] as any[]
  };

  const lines = content.split('\n');
  let currentSection = '';
  let currentShape: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    if (line === '[layers]') {
      currentSection = 'layers';
      continue;
    }
    if (line === '[maingate]') {
      currentSection = 'maingate';
      result.mainGate = {};
      continue;
    }
    if (line === '[shapes]') {
      currentSection = 'shapes';
      continue;
    }

    if (currentSection === 'layers') {
      const parts = line.split('|');
      if (parts.length >= 2) {
        result.layers.push({
          id: isNaN(Number(parts[0])) ? parts[0] : Number(parts[0]),
          name: parts[1],
          visible: parts[2] === 'true',
          expanded: parts[3] === 'true',
          category: parts[4] || ''
        });
      }
    } else if (currentSection === 'maingate') {
      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        const key = line.substring(0, eqIdx).trim();
        const val = line.substring(eqIdx + 1).trim();
        if (key === 'x' || key === 'y' || key === 'rotation') {
          result.mainGate[key] = Number(val);
        } else {
          result.mainGate[key] = val;
        }
      }
    } else if (currentSection === 'shapes') {
      if (line === '---') {
        if (currentShape) {
          result.shapes.push(currentShape);
        }
        currentShape = null;
        continue;
      }

      if (!currentShape) {
        currentShape = {};
      }

      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        const key = line.substring(0, eqIdx).trim();
        let val: any = line.substring(eqIdx + 1).trim();

        if (key === 'points') {
          // Convert space-separated coord string back to array of {x, y} objects
          val = val.split(' ').map((p: string) => {
            const [x, y] = p.split(',').map(Number);
            return { x, y };
          });
        } else if (val === 'true') {
          val = true;
        } else if (val === 'false') {
          val = false;
        } else if (!isNaN(Number(val)) && val !== '') {
          val = Number(val);
        } else if (val.startsWith('[') || val.startsWith('{')) {
          try {
            val = JSON.parse(val);
          } catch (_) {}
        }

        currentShape[key] = val;
      }
    }
  }

  // Push last shape if any
  if (currentShape) {
    result.shapes.push(currentShape);
  }

  return result;
}
