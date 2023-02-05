const jwt = require("jsonwebtoken");
const config = require("../configs/auth.config.js");
const db = require('../models/index');
const User = db.User;

let verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        req.userId = decoded.id;
        next();
    });
};

let isAdmin = async (req, res, next) => {
    let data = await User.findByPk(req.userId)

    // .then(user => {
    // user.getRoles().then(roles => {
    if (data.roleId === "R1") {
        next();
        return;
    }


    res.status(403).send({
        message: "Require Admin Role!"
    });
    return;
}

let isDoctor = async (req, res, next) => {
    let data = await User.findByPk(req.userId)
    if (data.roleId === "R2") {
        next();
        return;
    }
    res.status(403).send({
        message: "Require Doctor Role!"
    });
}

// isPatient = async (req, res, next) => {
//     data = await User.findByPk(req.userId)
//     if (data.roleId === "R3") {
//         next();
//         return;
//     }
//     res.status(403).send({
//         message: "Require Patient Role!"
//     });
// }

let isDoctorOrAdmin = async (req, res, next) => {
    let data = await User.findByPk(req.userId)
    if (data.roleId === "R1" || data.roleId === "R2") {
        next();
        return;
    }

    if (data.roleId === "R2") {
        next();
        return;
    }

    res.status(403).send({
        message: "Require Doctor or Admin Role!"
    });
};

// const authJwt = {
//     verifyToken: verifyToken,
//     isAdmin: isAdmin,
//     isDoctor: isDoctor,
//     isDoctorOrAdmin: isDoctorOrAdmin
// };
// module.exports = authJwt;

module.exports = {
    verifyToken: verifyToken,
    isAdmin: isAdmin,
    isDoctor: isDoctor,
    isDoctorOrAdmin: isDoctorOrAdmin
}