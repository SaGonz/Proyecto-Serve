const startupDebugger = require('debug')('app:startup')
const dbDebugger = require('debug')('app:db')
const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const path = require('path');
const PORT = process.env.PORT || process.env.S_PORT;
      
const app = express()
app.use(cors())

// //Configurar permisos de CORS
const whitelist = ['127.0.0.1:3307','127.0.0.1:33017','localhost:3000','localhost:4000','https://lista-para-hacer.herokuapp.com/']
const corsOptions  = {
    origin: function(origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error('Este recurso no está permitido por CORS'))
        }
    }
}

app.options('*', cors())
    .use(express.static(path.join(__dirname, 'build')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
//    .get('/', (req, res) => res.render('build/index'))


const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})

const pool = mysql.createPool ({
    connectionLimit: 1000,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})

pool.getConnection(function(err, conexion) {
    if (err) {
        console.log('error de pool -----------',err)
        throw err
    }
    conexion.release()
});

app.get('/app*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/api/tareas', (req, res, next) => {
    const SELECCIONAR_TAREAS = `SELECT * FROM tarea WHERE id_estado="en proceso";`
    conexion.query(SELECCIONAR_TAREAS, (err, result) =>{
        if(err) {
            return res.send(err)
        } else {
            return res.json({
                data: result,
            })
        }
    })
})

app.get('/api/r-completadas',  (req,res) => {
    const SELECCIONAR_TAREAS_COMPLETADAS = `SELECT * FROM tarea WHERE id_estado="completada"`
    conexion.query(SELECCIONAR_TAREAS_COMPLETADAS, (err, result) =>{
        if(err) {
            res.send(err)
        } else {
            return res.json({
                data: result
            })
        }
    })
})

app.get('/llenar', (req, res) =>{
    const {titulo} = req.query
    const LLENAR_LISTA = 
    `INSERT INTO tarea (titulo,id_estado,fecha_creacion) VALUES ('${titulo}',"en proceso",NOW());`
     
    conexion.query(LLENAR_LISTA), (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.send("Te has propuesto una nueva tarea")
        }
    }
})

app.get('/completar', (req, res) => {
    const {id_tarea} = req.query
    const COMPLETAR_TAREA = `UPDATE tarea SET id_estado="completada",fecha_finalizacion=NOW() WHERE id_tarea = ${id_tarea}`
    conexion.query(COMPLETAR_TAREA, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            return res.send()
        }
    })
})

app.get('/borrar',  cors(), (req, res, next) => {
    const {id_tarea} = req.query
    const BORRAR_TAREA = `DELETE FROM tarea WHERE id_tarea = ${id_tarea}`
    conexion.query(BORRAR_TAREA), (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            console.log('has borrado una tarea')
            return res.send("Has borrado una tarea")
        }
    }
    next();
})

app.listen(PORT, () => {
    console.log('Server listening on port',PORT,'host',process.env.DB_HOST)
})

module.exports = app;
