import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const html = fs.readFileSync(path.resolve(process.cwd(), 'web', 'sports-football-transfer.html'), 'utf-8');
const root = parse(html);

const postContent = root.querySelector('div.post-content');
console.log('--- POST CONTENT TAGS ---');
postContent?.childNodes.filter((n: any) => n.nodeType === 1).forEach((c: any) => {
  console.log(`Tag <${c.tagName}> class="${c.getAttribute('class') || ''}": text="${c.text.trim().substring(0, 60)}..."`);
});

const tagsDiv = root.querySelector('div.flex.flex-wrap.items-center.gap-2.mb-8');
console.log('\n--- TAGS DIV ---');
console.log(tagsDiv?.innerHTML);

const shareDiv = root.querySelector('div.flex.flex-wrap.items-center.gap-3.mb-10');
console.log('\n--- SHARE DIV ---');
console.log(shareDiv?.innerHTML);
