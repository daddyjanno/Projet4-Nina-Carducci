const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const inputRoot = './images' // dossier d'origine
const outputRoot = './images_resized' // dossier de sortie
const sizes = [400, 800]
const formats = ['webp'] // formats à générer

// Fonction récursive pour parcourir les sous-dossiers
function processDirectory(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            processDirectory(fullPath)
        } else {
            const ext = path.extname(entry.name).toLowerCase()
            const validInput = ['.webp', '.jpg', '.jpeg', '.png']

            if (!validInput.includes(ext)) return

            const relativePath = path.relative(inputRoot, fullPath)
            const baseName = path.parse(relativePath).name
            const subDir = path.dirname(relativePath)

            formats.forEach((format) => {
                sizes.forEach((size) => {
                    const outputPath = path.join(outputRoot, subDir)
                    const outputFile = path.join(
                        outputPath,
                        `${baseName}-${size}w.${format}`
                    )

                    fs.mkdirSync(outputPath, { recursive: true })

                    sharp(fullPath)
                        .resize({ width: size })
                        .toFormat(
                            format,
                            format === 'jpg' ? { quality: 80 } : {}
                        )
                        .toFile(outputFile)
                        .then(() => console.log(`✅ Created ${outputFile}`))
                        .catch((err) =>
                            console.error(`❌ Error with ${fullPath}:`, err)
                        )
                })
            })
        }
    })
}

processDirectory(inputRoot)
