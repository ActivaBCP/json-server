const jsonServer = require('json-server')
const path = require('path')

const server = jsonServer.create()

const router = jsonServer.router(path.join(__dirname, 'db.json'))

const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use('/api/v1', router)

server.listen(process.env.PORT || 3000, () => {
    console.log('JSON Server is running')
})