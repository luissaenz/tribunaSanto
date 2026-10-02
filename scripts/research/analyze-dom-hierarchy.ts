import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

function analyzeDOMHierarchy(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const root = parse(content);

  console.log(`\n=== STRUCTURE OF ${path.basename(filePath)} ===`);
  const main = root.querySelector('main');
  if (!main) {
    console.log('No <main> found!');
    return;
  }

  // Print direct children of main
  const children = main.childNodes.filter(n => n.nodeType === 1);
  console.log(`<main> has ${children.length} direct element children:`);
  children.forEach((c: any, i) => {
    console.log(`  [${i}] <${c.tagName}> class="${c.getAttribute('class') || ''}" id="${c.getAttribute('id') || ''}"`);
    // Inspect child's children
    const grandChildren = c.childNodes.filter((n: any) => n.nodeType === 1);
    grandChildren.forEach((gc: any, gi: number) => {
      console.log(`      [${i}.${gi}] <${gc.tagName}> class="${gc.getAttribute('class') || ''}"`);
    });
  });
}

const webDir = path.resolve(process.cwd(), 'web');
analyzeDOMHierarchy(path.join(webDir, 'index.html'));
analyzeDOMHierarchy(path.join(webDir, 'sports-football-transfer.html'));
analyzeDOMHierarchy(path.join(webDir, 'sports.html'));
