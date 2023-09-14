import fs from 'fs'
import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminWebp from 'imagemin-webp'
import path from 'path'

/**
 * imagemin: via Node.js, ref: https://www.npmjs.com/package/imagemin
 * imagemin-mozjpeg: lossy compression, ref: https://www.npmjs.com/package/imagemin-mozjpeg
 * imagemin-pngquant: lossy compression, ref: https://www.npmjs.com/package/imagemin-pngquant
 * imagemin-webp: lossy / lossless compression and will convert all files to webp, ref: https://www.npmjs.com/package/imagemin-webp
 */

// all jpeg / png / webp images will compress in this folder and its subfolders
const rootDirPath = 'target-folder'

// WARNING: processed images will DIRECTLY REPLACE original images
const process = async (dirPath) => {
  try {
    const files = fs.readdirSync(dirPath)

    // iterate through all files and folders
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stat = fs.statSync(filePath)

      // continue to search within w/ recursion while reaching a directory
      if (stat.isDirectory()) {
        process(filePath)
      } else {
        if (file.match(/\.(jpeg|jpg|png)$/i)) {
          await imagemin([filePath], {
            destination: path.dirname(filePath),
            plugins: [imageminMozjpeg({ quality: 75 }), imageminPngquant({ quality: [0.6, 0.8] })]
          })

          // since imagemin-webp converts all files to webp, this step is executed separately
        } else if (file.match(/\.(webp)$/i)) {
          await imagemin([filePath], {
            destination: path.dirname(filePath),
            plugins: [imageminWebp({ quality: 50 })]
          })
        }
      }
    }
    console.log(`compress and replace images in ${dirPath}`)
  } catch (error) {
    console.error(`error processing in ${dirPath}: ${error.message}`)
  }
}

await process(rootDirPath)
