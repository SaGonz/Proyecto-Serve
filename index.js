const startupDebugger = require('debug')('app:startup')
const dbDebugger = require('debug')('app:db')
const dbConfig = require("../config/db.config.js");
//Para guardar secretos
const dotenv = require('dotenv')
dotenv.config()
//crear servidor
const express = require('express')
//Para hacer log de las peticiones del servidor
const morgan = require('morgan')
const helmet = require('helmet')
const config = require('config')
const cors = require('cors')
const mysql = require('mysql')
const path = require('path');


//El objeto Express representa la aplicación
const app = express()
app.use(cors())
app.use(helmet())

//Serve React
app.use(express.static(path.join(__dirname, 'build')));

//Configuración
console.log('Nombre de la aplicación: '+config.get('name'))

if(app.get('env') === 'development') {
    app.use(morgan('dev'))
    startupDebugger('morgan activado')
}
dbDebugger('conectado a la Base de Datos, debuggeando')

const conexion = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
})

conexion.connect(err => {
    if(err) {
        return err;
    } else {
        console.log('conexion correcta a bbdd')
    }
})


//Construir archivos de React desde Node 
app.get('/app*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/tareas', (req, res, next) => {
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

//Ruta para ver las tareas completadas
app.get('/r-completadas', (req,res) => {
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

//POST
app.get('/llenar', (req, res) =>{
    console.log('so you want to write a task')
    const {titulo} = req.query
    const LLENAR_LISTA = 
    `INSERT INTO tarea (titulo,id_estado,fecha_creacion) VALUES ('${titulo}',"en proceso",NOW());`
     
    conexion.query(LLENAR_LISTA), (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            console.log("la tarea se ha agregado con exito a la bbdd")
            return res.send("Te has propuesto una nueva tarea")
        }
    }
})

//POST para completadas
app.get('/completar', (req, res) => {
    console.log('----------so you want to check off a task------------')
    const {id_tarea} = req.query
    const COMPLETAR_TAREA = `UPDATE tarea SET id_estado="completada",fecha_finalizacion=NOW() WHERE id_tarea = ${id_tarea}`
    conexion.query(COMPLETAR_TAREA, (err, result) => {
        if(err) {
            console.log('------',err,'----------')
            return res.send(err)
        } else {
            console.log('----------has completado una tarea----------')
            return res.send()
        }
    })
})

//DELETE
app.get('/borrar', (req, res, next) => {
    console.log('----------so you want to delete off a task------------')
    const {id_tarea} = req.query
    const BORRAR_TAREA = `DELETE FROM tarea WHERE id_tarea = ${id_tarea}`
    conexion.query(BORRAR_TAREA), (err, result) => {
        if(err) {
            console.log('---------',err,'--------')
            return res.send(err)
        } else {
            console.log('has borrado una tarea')
            return res.send("Has borrado una tarea")
        }
    }
    next();
})

app.listen(process.env.S_PORT, () => {
    console.log('Server listening on port',process.env.S_PORT,'host',process.env.DB_HOST)
})

module.exports = app;
