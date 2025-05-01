const fs = require('fs')
const path = require('path')

const baseDir = './images_resized'
const sizes = [100, 200, 400, 800, 1600]
const formats = ['webp', 'jpg']
const outputFilePath = 'generated-pictures.html'

function generateSrcSet(relativePath, format) {
    return sizes
        .map((size) => {
            return `./${baseDir}/${size}/${relativePath}.${format} ${size}w`
        })
        .join(',\n      ')
}

function generatePictureTag(
    relativePath,
    alt = '',
    classList = 'd-block w-100'
) {
    const filename = path.basename(relativePath)
    const dirname = path.dirname(relativePath)
    const nameWithoutExt = path.parse(filename).name

    return `
<picture>
  <source 
    srcset="${generateSrcSet(path.join(dirname, nameWithoutExt), 'webp')}"
    type="image/webp"
    sizes="(max-width: 768px) 100vw, 100vw"
  >
  <source 
    srcset="${generateSrcSet(path.join(dirname, nameWithoutExt), 'jpg')}"
    type="image/jpeg"
    sizes="(max-width: 768px) 100vw, 100vw"
  >
  <img 
    src="./${baseDir}/800/${path.join(dirname, nameWithoutExt)}.jpg"
    alt="${alt}"
    class="${classList}"
    loading="lazy"
  >
</picture>
`.trim()
}

// Fonction récursive pour parcourir /800 et ses sous-dossiers
function walk(dir, callback) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            walk(fullPath, callback)
        } else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) {
            const relPath = path.relative(path.join(baseDir, '800'), fullPath)
            const relPathWithoutExt = relPath.replace(
                /\.(jpe?g|png|webp)$/i,
                ''
            )
            callback(relPathWithoutExt)
        }
    })
}

// Collecte et génère les tags
const pictureTags = []
const referenceDir = path.join(baseDir, '800')

if (!fs.existsSync(referenceDir)) {
    console.error(`❌ Le dossier ${referenceDir} n'existe pas.`)
    process.exit(1)
}

walk(referenceDir, (relativePath) => {
    const altText = relativePath.split(/[\\/]/).pop().replace(/[-_]/g, ' ')
    pictureTags.push(generatePictureTag(relativePath, altText))
})

// Sauvegarde dans un fichier
fs.writeFileSync(outputFilePath, pictureTags.join('\n\n'))
console.log(`✅ Fichier HTML généré : ${outputFilePath}`)
