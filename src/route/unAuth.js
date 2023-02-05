import express from "express";
import homeController from '../controller/homeController';
import userController from '../controller/userController'
import doctorController from '../controller/doctorController'
import patientController from '../controller/patientController'
import specialtyController from "../controller/specialtyController";
import clinicController from "../controller/clinicController";

let router = express.Router();
const initUnAuthRoute = (app) => {
    // Demo project (Not BookingCare API)
    router.get('/', homeController.getHomepage);
    router.get('/crud', homeController.getCRUD);
    router.post('/post-crud', homeController.postCRUD);
    router.get('/get-crud', homeController.getAllUser);

    // BookingCare API
    router.get('/api/allcode', userController.getAllCode);
    router.get('/api/top-doctor-home', doctorController.getTopDoctorHome);
    router.get('/api/get-detail-doctor-by-id', doctorController.getDetailDoctorById);
    router.get('/api/get-schedule-doctor-by-date', doctorController.getScheduleByDate);
    router.get('/api/get-extra-infor-doctor-by-id', doctorController.getExtraInforDoctorById);
    router.get('/api/get-profile-doctor-by-id', doctorController.getProfileDoctorById);
    router.post('/api/patient-book-appointment', patientController.postBookAppointment);
    router.post('/api/verify-book-appointment', patientController.postVerifyBookAppointment);
    router.post('/api/verify-payment', patientController.verifyPayment);
    router.post('/api/transfer', patientController.transfer);
    router.get('/api/get-detail-bill', patientController.getDetailBillByToken);
    router.get('/api/get-specialty', specialtyController.getAllSpecialty);
    router.get('/api/get-detail-specialty-by-id', specialtyController.getDetailSpecialtyById);
    router.get('/api/get-clinic', clinicController.getAllClinic);
    router.get('/api/get-detail-clinic-by-id', clinicController.getDetailClinicById);
    router.post('/api/login', userController.handleLogin);
    router.get('/api/contract/abi', patientController.getContractAbi);
    router.post('/api/init-bill', patientController.initBill)
    router.get('/api/test', userController.myTest);


    return app.use('/', router)
}

export default initUnAuthRoute;