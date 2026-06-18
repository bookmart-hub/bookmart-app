const fs = require('fs');
const path = require('path');

const dir = 'src/screens/others';
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (!file.endsWith('Screen.tsx')) return;
    let filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('CategoryMasonryLayout')) {
        content = content.replace(/<CategoryMasonryLayout\s*title="[^"]*"\s*subtitle=\{data\.subtitle\}\s*leftColumnData=\{data\.left\}\s*rightColumnData=\{data\.right\}\s*\/>/, '<CategoryMasonryLayout data={data.items} />');

        // Sometimes title is something else, let's just use a more generic replace
        content = content.replace(/<CategoryMasonryLayout[\s\S]*?\/>/, '<CategoryMasonryLayout data={data.items} />');

        fs.writeFileSync(filePath, content);
    }
});

console.log('Screens updated');
