const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'development',

    target: 'node',

    entry: './src/Server/index.ts',

    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },

    externals: [nodeExternals()],

    devtool: 'source-map',
};
