require('dotenv').config()

const jsonServer = require('json-server')
const path = require('path')
const cors = require('cors')
const multer = require('multer')
const { v2: cloudinary } = require('cloudinary')

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

server.use(cors())

server.post('/api/v1/upload', upload.single('file'), (req, res) => {
  if (!process.env.CLOUDINARY_URL) {
    return res.status(503).json({
      error: 'Cloudinary no configurado. Crea un archivo .env con CLOUDINARY_URL.',
    })
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo (campo "file").' })
  }

  if (!req.file.mimetype.startsWith('image/')) {
    return res.status(400).json({ error: 'Solo se permiten imágenes.' })
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'activa/iniciativas', resource_type: 'image' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error.message)
        return res.status(500).json({ error: error.message })
      }
      res.json({
        url: result.secure_url,
        publicId: result.public_id,
      })
    }
  )

  stream.end(req.file.buffer)
})

server.use(middlewares)
server.use('/api/v1', router)

const port = process.env.PORT || 3000
server.listen(port, () => {
  const cloudinaryOk = Boolean(process.env.CLOUDINARY_URL)
  console.log(`JSON Server is running on http://localhost:${port}`)
  console.log(
    cloudinaryOk
      ? 'Cloudinary: configurado (subida de imágenes activa)'
      : 'Cloudinary: sin CLOUDINARY_URL en .env (subida desactivada)'
  )
})
