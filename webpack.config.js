const path = require('path');

module.exports = {
    mode: 'development',

    entry: './client/index.ts',

    module: {
        rules: [
            {
                test: /\.tsx?$/,    // good
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(__dirname, 'tsconfig.json'), // <-- explicitly set it
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
        extensions: ['.tsx', '.ts', '.js', '.css', '.scss'], // <-- added '.tsx' for React or strict TSX support
    },

    output: {
        filename: 'index.js',
        chunkFilename: 'index.js',
        path: path.resolve(__dirname, 'public', 'dist'),
        clean: true,
    },

    devtool: 'source-map',
};
