// codigo de servidor web 
const http = require("http"); // libreria para manejo de peticiones http
const path = require("path"); // libreria para manejo de rutas de archivos
const fs = require("fs"); // libreria para manejo de archivos

// se define un servidor 
const server = http.createServer((req, res) => {
  if (req.method == "GET" && req.url == "/") {
    fs.createReadStream(path.resolve("index.html")).pipe(res);
    return;
  }

  if (req.method == "GET" && req.url == "/video") {
    const chunkSize = 10 ** 6 / 2; // 0.5 MB // tamaño de los fragmentos
    const filepath = path.resolve("video.mp4"); // obtiene la direccion del video 
    const filesize = fs.statSync(filepath).size; // obtener el tamaño del archivo mp4
    const range = req.headers.range; // se obtiene el rango desde las cabeceras de la peticion 

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-"); // dividir el rango del arquivo en partes
      const start = parseInt(parts[0], 10); // se calcula el inicio del fragmento
      const end = Math.min(start + chunkSize, filesize - 1); // se calcula el final del fragmento
      const file = fs.createReadStream(filepath, { start, end }); // se crea el archivo que va a ser enviado por fragmentos
      
      const contentLength = end - start + 1; 
      // cabeceras para respuesta http
      const head = {
        "Content-Range": `bytes ${start}-${end}/${filesize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
      };
      // se escriben las cabeceras y se envia la respuesta mediante una tuberia
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // si no se le pasa el rango en la peticion esta lo rechaza
      res.statusCode(400).send("Range header is required");
    }
  }
});

// se establece el numero de puerto donde estara escuchando el servidor
const PORT = process.env.PORT || 3000;

// se pone a escucha el servidor en el puerto configurado
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
