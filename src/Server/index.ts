import { randomUUID } from 'crypto'
import express, { Request, Response } from 'express'
import { Layer } from 'Model/Layer'
import path from 'path'
import multer from 'multer'

const app = express()
const PORT = 3000

const publicDir = path.join(__dirname, '/../public')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + '/../uploads/')
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
  },
]

app.use(express.static(publicDir))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'))
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

  console.log('moo', layers)

  response.json({ ok: true })
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
