/* eslint comma-dangle: 0 */
const webpack = require('webpack');
const prod = process.env.NODE_ENV === 'production';

function getEntrySources(sources) {
    if (!prod) {
        sources.push('webpack-dev-server/client?http://localhost:8080');
        sources.push('webpack/hot/only-dev-server');
    }
    return sources;
}

module.exports = {
    entry: {
        app: getEntrySources(['./src/index'])
    },
    stats: {
        cached: false,
        cachedAssets: false,
        chunkModules: false,
        chunks: false,
        colors: true,
        errorDetails: true,
        hash: false,
        progress: true,
        reasons: false,
        timings: true,
        version: false
    },
    output: {
        publicPath: 'http://localhost:8080/',
        filename: prod ? './dist/audio-component.js' : './dist/[name].js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/,
            query: {
                plugins: ['transform-runtime', 'add-module-exports'],
                presets: ['es2015', 'stage-1']
            }
        }, {
            test: /\.(glsl|frag|vert)$/,
            loader: 'raw',
            exclude: /node_modules/
        }, {
            test: /\.(glsl|frag|vert)$/,
            loader: 'glslify',
            exclude: /node_modules/
        }]
    },
    plugins: prod ? [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false
            }
        })
    ] : []
}