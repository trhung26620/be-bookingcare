import { json } from 'body-parser';
// import pool from '../configs/connectDB';
import multer from 'multer'
import db from '../models/index'
import CRUDService from '../services/CRUDService'

let getHomepage = async (req, res) => {
    try {
        let dataUser = await db.User.findAll()
        return res.render('index.ejs', { dataUser: dataUser })
    } catch (error) {
        console.log(error);
    }
}
let getCRUD = async (req, res) => {
    return res.render('crud.ejs');
}

let postCRUD = async (req, res) => {
    let message = await CRUDService.createNewUser(req.body);
    return res.send('test postCRUD');
}

let getAllUser = async (req, res) => {
    let dataUser = await CRUDService.getAllUser()
    return res.render('index.ejs', { dataUser: dataUser })
}
module.exports = {
    getHomepage, getCRUD, postCRUD, getAllUser
    // , getDetailPage, createNewUser, deleteUser, getEditPage, postUpdateUser, getUploadFilePage,
    // handleUploadFile, handleUploadMultipleFiles
}