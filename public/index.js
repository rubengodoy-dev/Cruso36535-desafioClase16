
const formulario = document.querySelector("#nuevoProducto")
const socket = io();

socket.on('productos', (data) => {
    console.log("recibido de socket")
    console.log(data)
    actualizarProductos(data)
})

socket.on("messages", (data) => {
    actualizarMensajes(data);
});

formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(formulario);
    const producto = {
        title: formData.get('title'),
        price: formData.get('price'),
        thumbnail: formData.get('thumbnail'),

    };
    socket.emit('nuevo-producto', producto)
    swal.fire("Enviado!", `El producto se ha agredado correctamente.`, "success");
    formulario.reset()
})


function actualizarProductos(productos) {
    fetch('/listado.hbs')
        .then(response => response.text())
        .then(data => {
            const template = Handlebars.compile(data); // compila la plantilla
            const html = template({ array: productos }); // genera el html
            document.querySelector('#listadoProductos').innerHTML = html; // inyecta el resultado en la vista

        })
        .catch(err => {
            console.error(err);
        });

}


function addMessage(e) {
    const mensaje = {
        author: document.getElementById("username").value,
        text: document.getElementById("texto").value,
        date: new Date().toLocaleString(),
    };
    socket.emit("new-message", mensaje);
    document.getElementById("texto").value = '';

    return false;
}

function actualizarMensajes(data) {
    const htmlMensajes = data
        .map((elem) => {
            return `<div>
              <b style="color:blue;">${elem.author}</b>
              [<span style="color:brown;">${elem.date}</span>] :
              <i style="color:green;">${elem.text}</i>
          </div>`;
        })
        .join(" ");
    document.getElementById("messages").innerHTML = htmlMensajes;
}