[![NPM version](https://badge.fury.io/js/less-plugin-autoprefixer.svg)](http://badge.fury.io/js/less-plugin-autoprefixer)

# less-plugin-autoprefixer

Uses [autoprefixer][] to add prefixes to css after conversion from less.

This is an up-to-date fork of [less-plugin-autoprefix][].

## Usage

```
npm install less less-plugin-autoprefixer
```

### CLI

```
npx lessc file.less --autoprefix="> 0.5%, not dead"
```

The `--autoprefix` option value is a [browserslist query](https://github.com/browserslist/browserslist#best-practices).

### JS

```js
const LessPluginAutoPrefixer = require('less-plugin-autoprefixer');

less.render(lessString, {
    plugins: [
        new LessPluginAutoPrefixer({
            browsers: ['> 0.5%, not dead'],
        }),
    ],
}).then(({ css, map, imports }) => {
    // ...
});
```

### Browser

Browser usage is not supported.

[autoprefixer]: https://github.com/postcss/autoprefixer#readme
[less-plugin-autoprefix]: https://github.com/less/less-plugin-autoprefix
