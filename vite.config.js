const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'lib/LinkStateJS.ts'),
            name: 'LinkStateJS',
            fileName: (format) => `link-state-js.${format}.js`
        },
        rollupOptions: {
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    elaine: 'LinkStateJS'
                }
            }
        }
    }
})
