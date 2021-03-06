var http = require("http");
var fs = require("fs");
var url = require("url");

var template = require("./lib/template.js");

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
        var list = template.list(filelist);
        var html = template.html(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
        response.writeHead(200);
        response.end(html);
      });
    } else {
      fs.readdir("./data", function (err, filelist) {
        fs.readFile(`data/${queryData.get("id")}`, "utf8", function (err, description) {
          var title = queryData.get("id");
          var list = template.list(filelist);
          var html = template.html(
            title,
            list,
            `<h2>${title}</h2>${description}`,
            `
            <a href="/create">create</a>
            <a href="/update?id=${title}">update</a>
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <input type="submit" value="delete">
            </form>
            `
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", function (err, filelist) {
      var title = "WEB - create";
      var list = template.list(filelist);
      var html = template.html(
        title,
        list,
        `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="제목"/></p>
        <p><textarea name="description" placeholder="설명"></textarea></p>
        <p><input type="submit" /></p>
      </form>
      `,
        ""
      );
      response.writeHead(200);
      response.end(html);
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
  } else if (pathname === "/update") {
    fs.readdir("./data", function (err, filelist) {
      fs.readFile(`data/${queryData.get("id")}`, "utf8", function (err, description) {
        var title = queryData.get("id");
        var list = template.list(filelist);
        var html = template.html(
          title,
          list,
          `
          <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="제목" value="${title}"/></p>
          <p><textarea name="description" placeholder="설명">${description}</textarea></p>
          <p><input type="submit" /></p>
        </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname === "/update_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var id = new URLSearchParams(body).get("id");
      var title = new URLSearchParams(body).get("title");
      var description = new URLSearchParams(body).get("description");
      fs.rename(`data/${id}`, `data/${title}`, function (error) {
        fs.writeFile(`data/${title}`, description, "utf8", function (err) {
          response.writeHead(302, { Location: `/?id=${title}` });
          response.end();
        });
      });
    });
  } else if (pathname === "/delete_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var id = new URLSearchParams(body).get("id");
      fs.unlink(`data/${id}`, function (err) {
        response.writeHead(302, { Location: `/` });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
