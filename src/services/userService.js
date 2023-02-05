import { resolve } from "app-root-path"
import db from "../models/index"
import bcrypt from 'bcryptjs'
import e from "express"
import { isPluginRequired } from "@babel/preset-env";
const salt = bcrypt.genSaltSync(10);
import jwt from 'jsonwebtoken'
const Op = db.Sequelize.Op;
const config = require("../configs/auth.config");
// import Web3 from 'web3';
// import { CONTACT_ADDRESS, CONTACT_ABI, provider } from './loadContract'
import { loadContract } from './loadContract'
// import { contract } from './loadContract'
require('dotenv').config();

// const contract = loadContract()

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {}
            let isExist = await checkUserEmail(email);
            if (isExist) {
                let user = await db.User.findOne({
                    where: { email: email },
                    attributes: ['id', 'email', 'roleId', 'password', 'firstName', 'lastName'],
                    raw: true
                })
                if (user) {
                    let check = await bcrypt.compareSync(password, user.password);
                    if (check) {
                        var token = await jwt.sign({ id: user.id }, config.secret, {
                            expiresIn: 86400 // 24 hours
                        });

                        userData.errCode = 0;
                        userData.errMessage = 'Ok';
                        delete user.password;
                        userData.user = user;
                        userData.user.accessToken = token;
                    } else {
                        userData.errCode = 1;
                        userData.errMessage = `Your email or password is incorrect!`
                    }
                } else {
                    userData.errCode = 1;
                    userData.errMessage = `Your email or password is incorrect!`
                }
            } else {
                userData.errCode = 1;
                userData.errMessage = `Your email or password is incorrect!`
            }
            resolve(userData)
        } catch (error) {
            reject(error)
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            })
            if (user) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (error) {
            reject(error)
        }
    })
}

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            resolve(users)
        } catch (error) {
            reject(error)
        }
    })
}

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // var hashPassword = await bcrypt.hashSync(password, salt);
            // resolve(hashPassword)
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Your email is already used'
                })
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.avatar,
                    walletAddress: data.walletAddress
                })
                if (data.walletAddress) {
                    let contract = loadContract();
                    await contract.methods.registerAccountForDoctor(data.walletAddress).send({
                        from: process.env.ACCOUNT_ADDRESS
                    })
                }
                resolve({
                    errCode: 0,
                    message: 'OK',
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            var hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword)
        } catch (e) {
            reject(e)
        }
    })
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        let user = await db.User.findOne({
            where: { id: userId }
        })
        if (!user) {
            resolve({ errCode: 2, errMessage: `The user isn't exist` })
        }
        await db.User.destroy({
            where: { id: userId }
        });
        resolve({ errCode: 0, message: `The user is deleted` })
    })
}

let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.firstName || !data.lastName || !data.address || !data.roleId
                || !data.phonenumber || !data.positionId || !data.gender || !data.walletAddress) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let user = await db.User.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (user) {
                    user.firstName = data.firstName;
                    user.lastName = data.lastName;
                    user.address = data.address;
                    user.roleId = data.roleId;
                    user.positionId = data.positionId;
                    user.gender = data.gender;
                    user.phonenumber = data.phonenumber;
                    if (data.avatar) {
                        user.image = data.avatar;
                    };
                    user.walletAddress = data.walletAddress;
                    await user.save();
                    // let contract = loadContract();
                    // await contract.methods.registerAccountForDoctor(data.walletAddress).send({
                    //     from: process.env.ACCOUNT_ADDRESS
                    // })
                    resolve({
                        errCode: 0,
                        message: 'Update the user succeeds!'
                    });
                } else {
                    resolve({
                        errCode: 1,
                        errMessage: `User's not found!`
                    });
                }
            }

        } catch (error) {
            reject(error)
        }
    })
}

let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters !'
                })
            } else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput }
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res);
            }
        } catch (error) {
            reject(error)
        }
    })
}

let myTest = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // const web3 = new Web3(provider);
            // let contract = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
            let contract = loadContract();
            let temp2 = await contract.methods.getBalanceByDoctorAccountDebug('0x03A338b062bE0b681b228405cFd8496df8eFe077').call();
            console.log("🚀 ~ file: userService.js:233 ~ returnnewPromise ~ temp2", temp2)
            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: temp2
            })
        } catch (error) {
            reject(error)
        }
    })
}
module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData,
    getAllCodeService: getAllCodeService,
    myTest: myTest
}