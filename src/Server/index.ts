import express, { Request, Response } from 'express'
import path from 'path'
import multer from 'multer'
import fs from 'fs'
import { UserData } from 'Model/UserData'
import { PlacementImage } from 'Client/Model/Placement'
import { Layer } from 'Model/Layer'
import { UserDataFactory } from 'Model/Factory/UserDataFactory'

const app = express()
const PORT = 3000

const publicDir = path.join(__dirname, '/../public')
const uploadsDir = __dirname + '/../uploads/'
const layersJsonFileDir = __dirname + '/../data/layers.json'
const placementImagesJsonFileDir = __dirname + '/../data/placement-images.json'
const userDataFileDir = __dirname + '/../data/user-data.json'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

function readJson<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8')

  return JSON.parse(content)
}

function writeJson<T>(filePath: string, data: T) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

if (!fs.existsSync(layersJsonFileDir)) {
  writeJson(layersJsonFileDir, [])
}
if (!fs.existsSync(placementImagesJsonFileDir)) {
  writeJson(placementImagesJsonFileDir, [])
}
if (!fs.existsSync(userDataFileDir)) {
  writeJson(userDataFileDir, UserDataFactory.make())
}

app.use(express.static(publicDir))
app.use(express.json({ limit: '50mb' }))

app.get('/', (_, response: Response) => {
  response.sendFile(path.join(publicDir, 'index.html'))
})

app.get('/play', (_, response: Response) => {
  response.sendFile(path.join(publicDir, 'play.html'))
})

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg']

app.get('/sheets', (_, response) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return response.status(500).json({ error: 'Failed to read uploads directory' })
    }

    const sheets = files
      .filter((filename: string) => {
        const ext = path.extname(filename).toLowerCase()
        return allowedExtensions.includes(ext)
      })
      .map((filename: string) => {
        const filePath = path.join(uploadsDir, filename)
        const fileData = fs.readFileSync(filePath)
        const base64Image = `data:image/${path.extname(filename).slice(1)};base64,${fileData.toString('base64')}`

        return {
          name: filename,
          imageSrc: base64Image,
        }
      })

    response.json(sheets)
  })
})

app.get('/layers', (_, response) => {
  response.json(readJson(layersJsonFileDir))
})

// @ts-ignore
app.post('/layers', (req: Request, res: Response) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Invalid data format' })

  const existing = readJson<Layer[]>(layersJsonFileDir)
  const updated = [...existing, ...req.body]
  writeJson(layersJsonFileDir, updated)

  res.json({ ok: true, message: 'posted ok' })
})

// @ts-ignore
app.patch('/layers', (req: Request, res: Response) => {
  const updatedLayer = req.body as Layer
  const layers = readJson<Layer[]>(layersJsonFileDir)
  const layer = layers.find(l => l.uuid === updatedLayer.uuid)

  if (!layer) {
    return res.status(404).json({ error: 'Layer not found' })
  }

  Object.assign(layer, updatedLayer)
  writeJson(layersJsonFileDir, layers)

  res.json({ ok: true, updatedLayer: layer })
})

app.post('/upload-files', upload.array('files[]'), (req, res) => {
  res.json({
    message: 'Files uploaded successfully!',
    files: (req.files as unknown as Express.Multer.File[]).map(file => ({
      originalName: file.originalname,
      savedAs: file.filename,
      path: file.path
    }))
  })
})

app.post('/user-data', (request: Request, response: Response) => {
  const body = request.body as UserData

  writeJson(userDataFileDir, body)
})

app.post('/placement-images', (request: Request, response: Response) => {
  const newPlacementImages = request.body as PlacementImage[]
  const existing = readJson<PlacementImage[]>(placementImagesJsonFileDir)
  const updated = [...existing, ...newPlacementImages]

  writeJson(placementImagesJsonFileDir, updated)

  response.json({ ok: true })
})

app.get('/placement-images', (_, response: Response) => {
  response.json(readJson(placementImagesJsonFileDir))
})

// @ts-ignore
app.delete('/layers/:uuid', (request: Request, response: Response) => {
  const { uuid } = request.params
  const layers = readJson<Layer[]>(layersJsonFileDir)
  const index = layers.findIndex(layer => layer.uuid === uuid)

  if (index === -1) {
    return response.status(404).json({ error: 'Layer not found' })
  }

  layers.splice(index, 1)
  writeJson(layersJsonFileDir, layers)

  response.json({ ok: true, deletedUuid: uuid })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
