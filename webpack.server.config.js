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
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(__dirname, 'tsconfig.json'),
                        },
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },

    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules',
        ],
        extensions: ['.ts'],
    },

    externals: [nodeExternals()],

    devtool: 'source-map',
};
