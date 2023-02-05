import express from "express";
import homeController from '../controller/homeController';
// import multer from 'multer';
// import path from 'path';
import userController from '../controller/userController'
import doctorController from '../controller/doctorController'
import patientController from '../controller/patientController'
import specialtyController from "../controller/specialtyController";
import clinicController from "../controller/clinicController";
// import { authJwt } from '../middleware/authJwt'
import { verifyToken, isAdmin, isDoctor, isDoctorOrAdmin } from '../middleware/authJwt'

// var appRoot = require('app-root-path');
let router = express.Router();

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, appRoot + '/src/public/images/');
//     },
//     // By default, multer removes file extensions so let's add them back
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

// const imageFilter = function (req, file, cb) {
//     // Accept images only
//     if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
//         req.fileValidationError = 'Only image files are allowed!';
//         return cb(new Error('Only image files are allowed!'), false);
//     }
//     cb(null, true);
// };

// let upload = multer({ storage: storage, fileFilter: imageFilter });
// let uploadMultipleFiles = multer({ storage: storage, fileFilter: imageFilter }).array('multiple_images', 2);

const initWebRoute = (app) => {
    // router.get('/', homeController.getHomepage);
    // router.get('/crud', homeController.getCRUD);
    // router.post('/post-crud', homeController.postCRUD);
    // router.get('/get-crud', homeController.getAllUser);
    // router.post('/api/login', userController.handleLogin);
    // router.get('/api/allcode', userController.getAllCode);
    // router.get('/api/top-doctor-home', doctorController.getTopDoctorHome);
    // router.get('/api/get-detail-doctor-by-id', doctorController.getDetailDoctorById);
    // router.get('/api/get-schedule-doctor-by-date', doctorController.getScheduleByDate);
    // router.get('/api/get-extra-infor-doctor-by-id', doctorController.getExtraInforDoctorById);
    // router.get('/api/get-profile-doctor-by-id', doctorController.getProfileDoctorById);
    // router.post('/api/patient-book-appointment', patientController.postBookAppointment);
    // router.post('/api/verify-book-appointment', patientController.postVerifyBookAppointment);
    // router.get('/api/get-specialty', specialtyController.getAllSpecialty);
    // router.get('/api/get-detail-specialty-by-id', specialtyController.getDetailSpecialtyById);
    // router.get('/api/get-clinic', clinicController.getAllClinic);
    // router.get('/api/get-detail-clinic-by-id', clinicController.getDetailClinicById);



    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Role admin
    router.get('/api/get-all-users', [verifyToken, isAdmin], userController.handleGetAllUsers);
    router.post('/api/create-new-user', [verifyToken, isAdmin], userController.handleCreateNewUser);
    router.delete('/api/delete-user', [verifyToken, isAdmin], userController.handleDeleteUser);
    router.post('/api/create-new-specialty', [verifyToken, isAdmin], specialtyController.createSpecialty);
    router.post('/api/create-new-clinic', [verifyToken, isAdmin], clinicController.createClinic);
    router.get('/api/get-all-doctors', [verifyToken, isAdmin], doctorController.getAllDoctors);
    router.post('/api/save-infor-doctors', [verifyToken, isAdmin], doctorController.postInforDoctor);
    // Role doctor
    router.post('/api/bulk-create-schedule', [verifyToken, isDoctor], doctorController.bulkCreateSchedule);
    router.get('/api/get-list-patient-for-doctor', [verifyToken, isDoctor], doctorController.getListPatientForDoctor);
    router.post('/api/send-remedy', [verifyToken, isDoctor], doctorController.sendRemedy);
    router.get('/api/get-doctor-info-by-id', [verifyToken, isDoctor], doctorController.getDoctorInfoById);

    // Role doctor or admin
    router.put('/api/edit-user', [verifyToken, isDoctorOrAdmin], userController.handleEditUser);

    // router.put('/api/edit-user', userController.handleEditUser);
    // router.post('/api/save-infor-doctors', doctorController.postInforDoctor);
    // router.post('/api/bulk-create-schedule', doctorController.bulkCreateSchedule);

    return app.use('/', router)
}
export default initWebRoute;