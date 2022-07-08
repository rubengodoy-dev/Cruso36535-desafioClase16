const PORT = 8080
const express = require("express")
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')

const app = express()
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);



const path = require("path")
app.use(express.static(path.join(__dirname, "public")))
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// parse application/json
app.use(express.json());



const server = httpServer.listen(PORT, () => {
    console.log("escuchando en puerto " + server.address().port);
})

server.on("error", err => console.log(err))


const { Contenedor } = require("./contenedor")
const { options: MariaDBOptions } = require('./options/MariaDB.js')
const { options: SQLiteOptions } = require('./options/SQLite3.js')

const containerProductos = new Contenedor(MariaDBOptions, "productos")
const containerMensajes = new Contenedor(SQLiteOptions, "mensajes")


let productos = []
let mensajes = []
io.on('connection', async (socket) => {

    console.log('Se conecto un cliente');
    console.log(socket.id);


    productos = await containerProductos.getAll()
    socket.emit('productos', productos);//mensaje para el cliente que inicio la conexion

    socket.on('nuevo-producto', async (d) => {
        console.log("recibo un nuevo producto");
        await containerProductos.save(d)
        productos = await containerProductos.getAll()
        io.sockets.emit('productos', productos)//mensaje para todos los clientes
    })

    mensajes = await containerMensajes.getAll()
    socket.emit('messages', mensajes);//mensaje para el cliente que inicio la conexion

    socket.on('new-message',async (d) => {
        console.log(d);
        //mensajes.push(d);
        await containerMensajes.save(d)
        mensajes = await containerMensajes.getAll()
        io.sockets.emit('messages', mensajes)//mensaje para todos los clientes
    })
})


