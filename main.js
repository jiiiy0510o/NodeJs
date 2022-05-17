var http = require("http");
var fs = require("fs");
var url = require("url");

function templateHTML(title, list, body, control) {
  return `  
  <!DOCTYPE html>
  <html>
    <head>
      <title>WEB - ${title}</title>
      <meta charset="utf-8" />
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
  </html>`;
}
function templateList(filelist) {
  var list = `<ul>`;
  var i = 0;
  while (i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }
  list = list + "</upm2l>";
  return list;
}

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var myUrl = new URL("http://localhost:3000" + _url);
  var queryData = myUrl.searchParams;
  var title = queryData.get("id");
  var pathname = myUrl.pathname;

  if (pathname === "/") {
    if (title === null) {
      fs.readdir("./data", function (err, filelist) {
        var title = "welcome";
        var description = "Hello, Node.js";
        var list = templateList(filelist);
        var template = templateHTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
        response.writeHead(200);
        response.end(template);
      });
    } else {
      fs.readdir("./data", function (err, filelist) {
        fs.readFile(`data/${queryData.get("id")}`, "utf8", function (err, description) {
          var title = queryData.get("id");
          var list = templateList(filelist);
          var template = templateHTML(
            title,
            list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", function (err, filelist) {
      var title = "WEB - create";
      var list = templateList(filelist);
      var template = templateHTML(
        title,
        list,
        `
      <form action="http://localhost:3000/create_process" method="post">
        <p><input type="text" name="title" placeholder="제목"/></p>
        <p><textarea name="description" placeholder="설명"></textarea></p>
        <p><input type="submit" /></p>
      </form>
      `,
        ""
      );
      response.writeHead(200);
      response.end(template);
    });
  } else if (pathname === "/create_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var title = new URLSearchParams(body).get("title");
      var description = new URLSearchParams(body).get("description");
      fs.writeFile(`data/${title}`, description, "utf8", function (err) {
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
