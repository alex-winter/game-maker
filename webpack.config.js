const path = require('path');

module.exports = {
    mode: 'development',

    entry: './src/Client/index.ts',

    module: {
        rules: [
            {
                test: /\.tsx?$/,    // good
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
                test: /\.css$/,     // good
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.scss$/,    // good
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
        ],
    },

    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules',
        ],
        extensions: ['.tsx', '.ts', '.js', '.css', '.scss'],
    },

    output: {
        filename: 'index.js',
        chunkFilename: 'index.js',
        path: path.resolve(__dirname, 'public', 'dist'),
        clean: true,
    },

    devtool: 'source-map',
};
