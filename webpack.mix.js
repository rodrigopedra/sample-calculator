const mix = require('laravel-mix');
const argv = require('yargs').argv;
const rimraf = require('rimraf');

rimraf.sync('dist/*');

mix.setPublicPath('dist')
mix.setResourceRoot('/')

mix.copy('index.html', 'dist/index.html')
mix.react('src/index.js', 'dist/app.js')

if (argv.hot) {
    mix.browserSync({proxy: 'http://localhost:3000/'});
    mix.options({hmrOptions: {host: 'localhost', port: 3000}})
}
