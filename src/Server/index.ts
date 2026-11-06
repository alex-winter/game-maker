import crypto from 'crypto'
import express from 'express'
import multer from 'multer'
import { config } from 'Server/config'
import { allowedExtension } from 'Server/services/allowed-extension'
import { UserDataFactory } from 'Model/Factory/UserDataFactory'
import { requestHandlerPlay } from 'Server/RequestHandlers/play'
import { requestHandlerIndex } from 'Server/RequestHandlers'
import { requestHandlerGetSheets } from 'Server/RequestHandlers/get-sheets'
import { requestHandlerGetLayers } from 'Server/RequestHandlers/get-layers'
import { requestHandlerPostLayers } from 'Server/RequestHandlers/post-layers'
import { requestHandlerGetUserData } from 'Server/RequestHandlers/get-user-data'
import { requestHandlerPatchUserData } from 'Server/RequestHandlers/patch-user-data'
import { requestHandlerPatchLayers } from 'Server/RequestHandlers/patch-layers'
import { requestHandlerPostPlacementImages } from 'Server/RequestHandlers/post-placement-images'
import { requestHandlerGetPlacementImages } from 'Server/RequestHandlers/get-placement-images'
import { requestHandlerDeleteLayers } from 'Server/RequestHandlers/delete-layers'
import { createDataFile } from 'Server/services/create-data-file'
import { requestHandlerPostFiles } from 'Server/RequestHandlers/post-files'
import { requestHandlerPostSpriteModel } from 'Server/RequestHandlers/post-sprite-model'
import { RequestHandler } from 'Server/types'

const app = express()
const port = config.port

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadsDir)
  },
  // The original name is display-only. The path is an id plus an allow-listed extension.
  filename: (req, file, cb) => {
    const extension = allowedExtension(file.originalname, config.allowedExtensions)

    if (extension === undefined) {
      cb(new Error(`Unsupported file type: ${file.originalname}`), '')
      return
    }

    cb(null, crypto.randomUUID() + extension)
  }
})
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowedExtension(file.originalname, config.allowedExtensions) === undefined) {
      cb(new Error(`Unsupported file type: ${file.originalname}`))
      return
    }

    cb(null, true)
  },
})

/** multer reports a rejected file as an error; answer it with a 400 instead of the default 500. */
const uploadSheets: RequestHandler = (request, response, next) => {
  upload.array('files[]')(request, response, (error: unknown) => {
    if (error instanceof Error) {
      response.status(400).json({ error: error.message })
      return
    }

    next()
  })
}

createDataFile(config.uploadsIndexFileDir)
createDataFile(config.layersJsonFileDir)
createDataFile(config.placementImagesJsonFileDir)
createDataFile(config.spriteModelsJsonFileDir)
createDataFile(config.userDataFileDir, UserDataFactory.make())

app.use(express.static(config.publicDir))
app.use(express.json({ limit: config.fileUploadSizeLimit }))

app.get('/', requestHandlerIndex)

app.get('/play', requestHandlerPlay)

app.get('/sheets', requestHandlerGetSheets)

app.get('/layers', requestHandlerGetLayers)
app.post('/layers', requestHandlerPostLayers)
app.patch('/layers', requestHandlerPatchLayers)
app.delete('/layers/:uuid', requestHandlerDeleteLayers)

app.post('/upload-files', uploadSheets, requestHandlerPostFiles)

app.get('/user-data', requestHandlerGetUserData)
app.patch('/user-data', requestHandlerPatchUserData)

app.post('/placement-images', requestHandlerPostPlacementImages)
app.get('/placement-images', requestHandlerGetPlacementImages)

app.post('/sprite-model', requestHandlerPostSpriteModel)


app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
