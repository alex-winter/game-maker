import { randomUUID } from 'crypto'
import express from 'express'
import { Layer } from 'Model/Layer'
import path from 'path'

const app = express()
const PORT = 3000

const publicDir = path.join(__dirname, '/../public')

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
