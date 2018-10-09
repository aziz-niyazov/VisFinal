module.exports = {
    entry: './src/main_vis.js',
    output: {
        filename: './bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/

            }
        ]
    }
};
