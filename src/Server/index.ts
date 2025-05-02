import { randomUUID } from 'crypto'
import express from 'express'
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

app.use(express.static(publicDir))

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'))
})

app.get('/layers', (_, response) => {
  const layers: Layer[] = [
    {
      uuid: randomUUID().toString(),
      name: 'Layer 1',
      created_at: new Date().toISOString(),
    }
  ]

  response.json(layers)
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
