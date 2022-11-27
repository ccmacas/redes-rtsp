const http = require("http");
const path = require("path");
const fs = require("fs");

const server = http.createServer((req, res) => {
  if (req.method == "GET" && req.url == "/") {
    fs.createReadStream(path.resolve("index.html")).pipe(res);
    return;
  }

  if (req.method == "GET" && req.url == "/video") {
    const chunkSize = 10 ** 6 / 2; // 0.5 MB
    const filepath = path.resolve("video.mp4");
    const filesize = fs.statSync(filepath).size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = Math.min(start + chunkSize, filesize - 1);
      const file = fs.createReadStream(filepath, { start, end });
      const contentLength = end - start + 1;
      const head = {
        "Content-Range": `bytes ${start}-${end}/${filesize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      res.statusCode(400).send("Range header is required");
    }
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
