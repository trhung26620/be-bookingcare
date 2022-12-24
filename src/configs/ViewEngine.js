import express from 'express';

const configViewEngine = (app) => {
    app.set("view engine", "ejs");
    app.set("views", "./src/views");
    app.use(express.static('./src/public'))
}
export default configViewEngine