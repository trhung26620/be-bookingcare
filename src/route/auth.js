import express from "express";
import userController from '../controller/userController'

let router = express.Router();
const initAuthRoute = (app) => {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    router.post("/api/login", userController.handleLogin);
    return app.use('/', router)
}

export default initAuthRoute;