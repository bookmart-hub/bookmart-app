const fs = require('fs');

let c = fs.readFileSync('src/data/categoryMockData.ts', 'utf8');

c = c.replace(/'([^']+)'\s*:\s*\{\s*subtitle:\s*'([^']+)',\s*left:\s*\[([\s\S]*?)\],\s*right:\s*\[([\s\S]*?)\]\s*\}/g, (m, k, s, l, r) => {
    let title = k.replace(/([A-Z])/g, ' $1').trim();
    if (k === 'ScinceFinction') title = 'Science Fiction';

    let lb = l.split('createMockBook').filter(x => x.trim().length > 0).map(x => 'createMockBook' + x.trim().replace(/,$/, ''));
    let rb = r.split('createMockBook').filter(x => x.trim().length > 0).map(x => 'createMockBook' + x.trim().replace(/,$/, ''));

    let items = [];
    items.push(`      { type: 'header', id: 'h_${k}', title: '${title}', subtitle: '${s}' }`);

    let max = Math.max(lb.length, rb.length);
    for (let i = 0; i < max; i++) {
        if (lb[i]) items.push(`      { type: 'book', id: 'bl_${i}_${k}', book: ${lb[i]} }`);
        if (rb[i]) items.push(`      { type: 'book', id: 'br_${i}_${k}', book: ${rb[i]} }`);

        if (i === 0) items.push(`      { type: 'ad', id: 'ad_${i}_${k}', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=200&fit=crop' }`);
    }

    return `  '${k}': { items: [\n${items.join(',\n')}\n    ] }`;
});

// Update the imports to include FeedItem
c = c.replace(/import \{ MasonryCategoryData, Book, Ratings \} from '\.\/models';/, `import { MasonryCategoryData, Book, Ratings, FeedItem } from './models';`);

fs.writeFileSync('src/data/categoryMockData.ts', c);
console.log('Script completed');
