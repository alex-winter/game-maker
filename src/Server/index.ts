import { randomUUID } from 'crypto'
import express, { Request, Response } from 'express'
import { Layer } from 'Model/Layer'
import path from 'path'
import multer from 'multer'
import fs from 'fs'
import { UserData } from 'Model/UserData'

const app = express()
const PORT = 3000

const publicDir = path.join(__dirname, '/../public')

const uploadsDir = __dirname + '/../uploads/'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

const layers = [
  {
    uuid: randomUUID().toString(),
    name: 'Layer 1',
    created_at: new Date().toISOString(),
    is_visible: true,
    is_active: true,
    placements: [],
  },
  {
    uuid: randomUUID().toString(),
    name: 'Layer 2',
    created_at: new Date().toISOString(),
    is_visible: true,
    is_active: false,
    placements: [],
  },
]

app.use(express.static(publicDir))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'))
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
  response.json(layers)
})

// @ts-ignore
app.post('/layers', (request: Request, response: Response) => {
  if (!Array.isArray(request.body)) {
    return response.status(400).json({ error: 'bad' })
  }

  layers.push(...request.body)

  response.json({ ok: true })
})

// @ts-ignore
app.patch('/layers', (request: Request, response: Response) => {
  const { uuid, ...updates } = request.body

  if (!uuid) {
    return response.status(400).json({ ok: false, error: 'Missing uuid' })
  }

  const layer = layers.find(l => l.uuid === uuid)

  if (!layer) {
    return response.status(404).json({ ok: false, error: 'Layer not found' })
  }

  Object.assign(layer, updates)

  response.json({ ok: true, updatedLayer: layer })
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
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
