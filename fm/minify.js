import fs from 'fs/promises';
import postcss from 'postcss';
import cssnano from 'cssnano';

(async () => {
    const raw = await fs.readFile('bleh.user.css', 'utf8');
    const inner = raw
        .replace(/\/\*==UserStyle==[\s\S]*?==\/UserStyle==\*\/\s*/, '')
        .replace(/^[\s\S]*?@-moz-document[^{]*\{/, '')
        .replace(/\}\s*$/, '');
    const {css} = await postcss([cssnano()]).process(inner, {from: undefined});
    await fs.writeFile('bleh.css', css, 'utf8');
    console.log('✔ bleh.css generated');
})();
