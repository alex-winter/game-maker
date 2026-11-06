import crypto from 'crypto'
import express from 'express'
import multer from 'multer'
import { config } from 'Server/config'
import { allowedExtension } from 'Server/services/allowed-extension'
import { UserDataFactory } from 'Model/Factory/UserDataFactory'
import { requestHandlerPlay } from 'Server/RequestHandlers/play'
import { requestHandlerIndex } from 'Server/RequestHandlers'
import { requestHandlerGetSheets } from 'Server/RequestHandlers/get-sheets'
import { requestHandlerGetAsset } from 'Server/RequestHandlers/get-asset'
import { ASSETS_PATH } from 'domain/asset-url'
import { requestHandlerGetUserData } from 'Server/RequestHandlers/get-user-data'
import { requestHandlerPatchUserData } from 'Server/RequestHandlers/patch-user-data'
import { requestHandlerGetPlacementImages } from 'Server/RequestHandlers/get-placement-images'
import { createDataFile } from 'Server/services/create-data-file'
import { requestHandlerPostFiles } from 'Server/RequestHandlers/post-files'
import { requestHandlerGetProject } from 'Server/RequestHandlers/get-project'
import { requestHandlerPostMaps } from 'Server/RequestHandlers/post-maps'
import { requestHandlerPatchMap } from 'Server/RequestHandlers/patch-map'
import { requestHandlerPutTileMap } from 'Server/RequestHandlers/put-tile-map'
import { requestHandlerDeleteMap, requestHandlerPutMapConnections, requestHandlerPutMapSize, requestHandlerPutStartMap } from 'Server/RequestHandlers/map-lifecycle'
import { ensureProjectFile } from 'Server/services/project-store'
import { requestHandlerPatchMetatile, requestHandlerPostTilesets, requestHandlerPutMapTileset } from 'Server/RequestHandlers/tilesets'
import { requestHandlerDeleteSprite, requestHandlerPostSprites, requestHandlerPutPlayerSprite, requestHandlerPutSprite } from 'Server/RequestHandlers/sprites'
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
createDataFile(config.placementImagesJsonFileDir)
createDataFile(config.userDataFileDir, UserDataFactory.make())
ensureProjectFile()

app.use(express.static(config.publicDir))
app.use(express.json({ limit: config.fileUploadSizeLimit }))

app.get('/', requestHandlerIndex)

app.get('/play', requestHandlerPlay)

app.get('/sheets', requestHandlerGetSheets)
app.get(ASSETS_PATH + '/:file', requestHandlerGetAsset)

app.get('/project', requestHandlerGetProject)
app.post('/project/maps', requestHandlerPostMaps)
app.patch('/project/maps/:mapId', requestHandlerPatchMap)
app.delete('/project/maps/:mapId', requestHandlerDeleteMap)
app.put('/project/maps/:mapId/size', requestHandlerPutMapSize)
app.put('/project/maps/:mapId/connections', requestHandlerPutMapConnections)
app.put('/project/start-map', requestHandlerPutStartMap)
app.put('/project/maps/:mapId/tileset', requestHandlerPutMapTileset)
app.put('/project/maps/:mapId/tile-map', requestHandlerPutTileMap)
app.post('/project/tilesets', requestHandlerPostTilesets)
app.patch('/project/tilesets/:tilesetId/metatiles/:metatileId', requestHandlerPatchMetatile)
app.post('/project/sprites', requestHandlerPostSprites)
app.put('/project/sprites/:spriteId', requestHandlerPutSprite)
app.delete('/project/sprites/:spriteId', requestHandlerDeleteSprite)
app.put('/project/player-sprite', requestHandlerPutPlayerSprite)


app.post('/upload-files', uploadSheets, requestHandlerPostFiles)

app.get('/user-data', requestHandlerGetUserData)
app.patch('/user-data', requestHandlerPatchUserData)

app.get('/placement-images', requestHandlerGetPlacementImages)


app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
