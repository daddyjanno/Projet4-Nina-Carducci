const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const inputRoot = './images' // Dossier contenant les images WebP
const outputRoot = './images_resized' // Dossier de sortie
const sizes = [100, 200, 400, 800, 1600]
const formats = ['jpg', 'png', 'webp'] // Formats à générer

// Fonction récursive pour parcourir tous les sous-dossiers
function processDirectory(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            processDirectory(fullPath) // appel récursif
        } else {
            const ext = path.extname(entry.name).toLowerCase()
            const validInput = ['.webp', '.jpg', '.jpeg', '.png']

            if (!validInput.includes(ext)) return

            const relativePath = path.relative(inputRoot, fullPath)
            const baseName = path.parse(relativePath).name // sans extension
            const subDir = path.dirname(relativePath)

            sizes.forEach((size) => {
                formats.forEach((format) => {
                    const outputPath = path.join(
                        outputRoot,
                        size.toString(),
                        subDir
                    )
                    const outputFile = path.join(
                        outputPath,
                        `${baseName}.${format}`
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
