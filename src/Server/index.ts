import express from 'express'
import multer from 'multer'
import { config } from 'Server/config'
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

const app = express()
const port = config.port

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadsDir)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

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

app.post('/upload-files', upload.array('files[]'), requestHandlerPostFiles)

app.get('/user-data', requestHandlerGetUserData)
app.patch('/user-data', requestHandlerPatchUserData)

app.post('/placement-images', requestHandlerPostPlacementImages)
app.get('/placement-images', requestHandlerGetPlacementImages)

app.post('/sprite-model', requestHandlerPostSpriteModel)


app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
