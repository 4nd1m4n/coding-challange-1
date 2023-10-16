const express = require("express");
const fs = require("fs");

const app = express();
const port = 3007;

const navigation = `
<a href="/">home</a>
<a href="/files">files</a>
`;

app.get("/", (_, res) => {
    res.send(navigation);
    res.end();
});

app.get("/files", (_, res) => {
    const ul = (item) => `<ul>${item}</ul>`;

    const path = process.cwd();
    const filenamesLinks = filenames(path).map(
        (filename) =>
            `<li><a href="/delete/${filename}">click to DELETE ${filename}</a></li>`
    );

    res.send(navigation + ul(filenamesLinks.join("")));
    res.end();
});

app.get("/delete/*", (req, res) => {
    let content = "";

    const filepath = process.cwd() + req.params[0];
    if (!fs.existsSync(filepath))
        res.send(`${filepath} does not exist anymore.`).end();

    fs.unlink(filepath, (err) => {
        if (err) {
            return console.error(err);
        }
        console.log("File deleted successfully!");

        content += `${Deleted} ${filepath}`;
    });

    res.send(navigation + content);
    res.end();
});

app.listen(port, () => {
    console.log("Server running on port: ", port);
});

function filenames(path) {
    return fs.readdirSync(path);
}
