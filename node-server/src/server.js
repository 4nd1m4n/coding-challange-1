const express = require("express");
const multer = require("multer");
const path_ = require("path");
const fs = require("fs");

// CONST

const app = express();
const port = 3007;

const navigation = `
<ul>
    <li><a href="/">home</a></li>
    <li><a href="/latest">latest file</a></li>
    <li><a href="/download-latest">download latest file</a></li>
    <li><a href="/files">(files)</a></li>
    <li><a href="/upload">upload</a></li>
</ul>
`;

// ROUTES

app.get("/", (_, res) => {
    res.send(navigation);
    res.end();
});

app.get("/latest", (_, res) => {
    const path = process.cwd();
    const files = fs
        .readdirSync(path, { withFileTypes: true })
        .filter((entry) => entry.isFile());

    const fileDetails = files.map((file) => {
        return {
            name: file.name,
            time: fs.statSync(path_.join(path, file.name)).mtime.getTime(),
        };
    });

    let latestFile = fileDetails.reduce((latest, current) => {
        return current.time > latest.time ? current : latest;
    }, fileDetails[0]);

    res.send(navigation + `<p>The latest file is ${latestFile.name}</p>`);
    res.end();
});

app.get("/download-latest", (_, res) => {
    const path = process.cwd();
    const file = getLatestFile(path);

    res.download(file);
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

app.get("/upload", (_, res) => {
    let content = `
    <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="fileUpload">
        <input type="submit" value="Upload">
    </form>
    `;

    res.send(navigation + content);
    res.end();
});

app.post("/upload", multer({ dest: "./" }).single("fileUpload"), (req, res) => {
    res.send(navigation + "File uploaded.");
    res.end();
});

app.get("/delete/*", (req, res) => {
    let content = "";

    const filepath = path_.join(process.cwd(), req.params[0]);
    if (!fs.existsSync(filepath))
        res.send(`${filepath} does not exist anymore.`).end();

    fs.unlink(filepath, (err) => {
        if (err) {
            return console.error(err);
        }
        content += `<span>Deleted ${filepath} deleted successfully!</span>`;
    });

    res.send(navigation + content);
    res.end();
});

// INIT

app.listen(port, () => {
    console.log(`Server running at: http://localhost:${port}`);
});

// UTIL

function filenames(path) {
    return fs.readdirSync(path);
}

function getLatestFile(path) {
    const files = fs
        .readdirSync(path, { withFileTypes: true })
        .filter((entry) => entry.isFile());

    const fileDetails = files.map((file) => {
        return {
            name: file.name,
            time: fs.statSync(path_.join(path, file.name)).mtime.getTime(),
        };
    });

    let latestFile = fileDetails.reduce((latest, current) => {
        return current.time > latest.time ? current : latest;
    }, fileDetails[0]);

    return latestFile.name;
}
