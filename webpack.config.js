const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',

    entry: {
        index: './src/Client/index.ts',
        play: './src/Client/play.ts',
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
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ],
            },
        ],
    },

    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules',
        ],
        extensions: ['.ts', '.css'],
    },

    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, 'public', 'dist'),
        clean: true,
    },

    devtool: 'source-map',

    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
    ],
};
