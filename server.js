const config = require('./config')
const consola = require('consola')
const express = require('express')
const session = require('express-session')
var cors = require('cors')

const usersRouter = require('./router/users.router')
const userRolRouter = require('./router/userRol.router')
const rutasRouter = require('./router/rutas.router')
const tutorialesRouter = require('./router/Tutoriales.router')
const rutaVideosRouter = require('./router/rutaVideos.router')
const rutasPagesRouter = require('./router/pages.router')
const Categories = require('./router/categories.router')

const passport = require('passport')
const MongoStore = require('connect-mongo')
const isAuthenticated = require('./middlewares/auth.middleware')

require('./authentication/passport') 

const db = require('./db')

//define por and server
const { port } = config
const server = express()

//configuramos el session
server.use( session({ 
    secret:'socialProgrammingApi',
    resave: false, 
    saveUninitialized: false, 
    cookie: {
        maxAge: 3600000 
    },
    store: MongoStore.create({
        mongoUrl: db.DB_URL
    })
}) )

server.use(express.json())
server.use(express.urlencoded({ extended: false }))
server.use(cors({
    origin: '*'
}))


server.use( passport.initialize() )
server.use( passport.session() )


//ruta test
server.get('/', (req, res) => {
    res.status(200).send('Welcome to social programming')
});

//router
server.use('/user-rols', userRolRouter)
server.use('/users', usersRouter)
server.use('/rutas', rutasRouter)
server.use('/tutoriales', tutorialesRouter)
server.use('/ruta-videos', rutaVideosRouter)
server.use('/pages', rutasPagesRouter)
server.use('/categories', Categories)

//use coge lo que venga no importa el metodo
server.use('*', (req, res, next) => {
    const error = new Error('Ruta no encontrada')
    error.status = 404
    return next(error)  //pasa al manejador de errores
});

//manejador de errores
server.use((err, _req, res, _next) => {
    return res
            .status(err.satus || 500)
            .json(err.message || 'Error Inesperado del servidor')
});


//conectamos a BBDD y luego lanzamos server
db.connectDB().then( ()=> {
    consola.success('Conectado a base de datos mongo')
    server.listen(port, () => {
        consola.success(`Iniciada api social programming en puerto ${port}`)
    })
}).catch( (e) => {
    consola.error(`Ha habido un error de conexion con BBDD: ${e}`)
})