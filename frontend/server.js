import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

// Serve built static files
app.use(express.static(join(__dirname, 'dist')))

// SPA fallback — toutes les routes non-statiques renvoient index.html
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`portfolio-index running on port ${PORT}`)
})
