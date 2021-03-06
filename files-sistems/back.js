var fs = require("fs");

var modelos = [
    {   nombre : 'Eventos',    singular : 'evento',      plural : 'eventos'},
    {   nombre : 'Imagenes',    singular : 'imagen',      plural : 'imagenes'},
    {   nombre : 'Instalaciones',    singular : 'instalacion',      plural : 'instalaciones'},
    {   nombre : 'Servicios',    singular : 'servicio',      plural : 'servicios'},
    {   nombre : 'Salones',    singular : 'salon',      plural : 'salones'},
    {   nombre : 'Prospectos',    singular : 'prospecto',      plural : 'prospectos'},
    {   nombre : 'Noticias',    singular : 'noticia',      plural : 'noticias'},
    {   nombre : 'Instrucciones',    singular : 'instruccion',      plural : 'instrucciones'}



]

fs.mkdirSync('controladores')
fs.mkdirSync('modelos')
fs.mkdirSync('rutas')

modelos.forEach(modelo => {

fs.createWriteStream("controladores/" + modelo.nombre  + ".js")
.write(
`const db = require('../relaciones');
var { ` + modelo.singular + ` } = db;

var ex = module.exports = {};

ex.create = (req, res, next) => ` + modelo.singular + `.create(req.body)
    .then(response => res.status(200).jsonp(response))

ex.delete = (req, res, next) => ` + modelo.singular + `.findById(req.params.id)
    .then(` + modelo.singular + ` => ` + modelo.singular + `.destroy())
    .then(response => res.status(200).jsonp(response))

ex.update = (req, res, next) => ` + modelo.singular + `.update(req.body, { where: { id: req.params.id } } )
    .then(response => res.status(200).jsonp(response))

ex.read =  (req, res, next) => req.params.id ?
    ` + modelo.singular + `.findById(req.params.id)
    .then(response => res.status(200).jsonp(response))
    :
    ` + modelo.singular + `.findAll()
    .then(response => res.status(200).jsonp(response))
`)

fs.createWriteStream("modelos/" + modelo.nombre  + ".js")
.write(
`module.exports = ({Sequelize, sequelize } = conector) =>
    sequelize.define('` + modelo.plural + `', {
        nombre: Sequelize.STRING
    },{
    	name : {
    		singular: '` + modelo.singular + `',
    		plural: '` + modelo.plural + `'
        }
	})

`)


fs.createWriteStream("rutas/" + modelo.nombre  + ".js")
.write(
`var route = require('express').Router();
var x = require('../controladores/` + modelo.nombre + `');

route.route('/data/` + modelo.singular + `')
        .get(x.read)
        .post(x.create);

route.route('/data/` + modelo.singular + `/:id')
        .get(x.read)
        .put(x.update)
        .delete(x.delete);

module.exports = route;

`)

})

var relaciones = fs.createWriteStream("relaciones.js")

relaciones.write(
`var conector = require('./conexion.js')`)

modelos.forEach(modelo => {
    relaciones.write(`var ` +  modelo.singular +`  = require('./modelos/` + modelo.nombre + `')(conector);`)
})

modelos.forEach(modelo => {
    relaciones.write(`module.exports.` +  modelo.singular  + ` = ` +  modelo.singular + ';')
})

relaciones.end()

// var main = fs.createWriteStream("mainejemplo.js")
//
// modelos.forEach(modelo => {
//
//     main.write("app.use('/', require('./http/rutas/" +  modelo.nombre  + "'));")
//
// })
