const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
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
/*app.get('/api/completadas', (req,res) => {
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
})*/

//POST
router.get('/llenar', (req, res) =>{
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
router.post('/completar', (req, res) => {
    console.log('so you want to check off a task')
    const {id_tarea} = req.query
    const COMPLETAR_TAREA = `UPDATE tarea SET id_estado="completo",fecha_finalizacion=NOW() WHERE id_tarea = ${id_tarea}`
    conexion.query(COMPLETAR_TAREA, (err, result) => {
        if(err) {
            return res.send(err)
        } else {
            console.log('has completado una tarea')
            return res.send("Has terminado una tarea")
        }
    })
})

//DELETE
router.post('/borrar', (req, res) => {
    console.log("borrar node hit")
    const {id_tarea} = req.query
    const BORRAR_TAREA = `DELETE FROM tarea WHERE id_tarea = ${id_tarea}`
    conexion.query(BORRAR_TAREA), (err, result) => {
        if(err) {
            console.log(err)
            return res.send(err)
        } else {
            console.log('has borrado una tarea')
            return res.send("Has borrado una tarea")
        }
    }
    next();
})

module.exports = router;