require('dotenv').config();
import nodemailer from 'nodemailer';
import { encode } from 'html-entities';

let sendSimpleEmail = async (dataSend) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_APP, // generated ethereal user
            pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `"MrTran 👻" <${process.env.EMAIL_APP}>`, // sender address
        to: dataSend.receiverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh", // Subject line
        // html: getBodyHTMLEmail(dataSend),
        html: getBodyHTMLEmail(dataSend)
    });
}

let getBodyHTMLEmail = (dataSend) => {
    let { patientName, time, doctorName } = dataSend
    patientName = encode(patientName);
    time = encode(time);
    doctorName = encode(doctorName);
    let result = ''
    if (dataSend.language === 'vi') {
        result =
            `
        <h3>Xin chào ${patientName}</h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên Booking Care</p>
        <p>Thông tin đặt lịch khám bệnh:</p>
        <div><b>Thời gian: ${time}</b></div>
        <div><b>Bác sĩ: ${doctorName}</b></div>

        <p>Nếu các thông tin trên là đúng sự thật, vui lòng click vào đường link bên dưới để xác nhận
        và hoàn tất thủ tục đặt lịch khám bệnh.</p>
        <div>
        <a href=${dataSend.redirectLink} target="_blank">Click here</a>
        </div>

        <div>Xin chân thành cảm ơn!</div>
        `
    }
    if (dataSend.language === 'en') {
        result =
            `
        <h3>Dear ${patientName}</h3>
        <p>You received this email because you booked an online medical appointment on Booking Care</p>
        <p>Information to book a medical appointment:</p>
        <div><b>Time: ${time}</b></div>
        <div><b>Doctor: ${doctorName}</b></div>

        <p>If the above information is true, please click on the link below to confirm and complete the procedure to book an appointment.</p>
        <div>
        <a href=${dataSend.redirectLink} target="_blank">Click here</a>
        </div>

        <div>Sincerely thank!</div>
        `
    }
    return result
}

let getBodyHTMLEmailRemedy = (dataSend) => {
    let { patientName } = dataSend;
    patientName = encode(patientName);
    let result = ''
    if (dataSend.language === 'vi') {
        result =
            `
        <h3>Xin chào ${patientName}!</h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên Booking Care</p>
        <p>Thông tin đơn thuốc/hóa đơn được gửi trong file đính kèm</p>

        <div>Xin chân thành cảm ơn!</div>
        `
    }
    if (dataSend.language === 'en') {
        result =
            `
        <h3>Dear ${patientName}!</h3>
        <p>You received this email because you booked an online medical appointment on Booking Care</p>
        <p>Prescription/invoice information is sent in the attached file</p>

        <div>Sincerely thank!</div>
        `
    }
    return result
}

let sendAttachment = async (dataSend) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_APP, // generated ethereal user
            pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `"MrTran 👻" <${process.env.EMAIL_APP}>`, // sender address
        to: dataSend.email, // list of receivers
        subject: "Kết quả đặt lịch khám bệnh", // Subject line
        html: getBodyHTMLEmailRemedy(dataSend),
        attachments: [{
            filename: `remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
            content: dataSend.imgBase64.split("base64,")[1],
            encoding: 'base64'
        }]
    });
}

let getBodyHTMLEmailConfirm = (dataSend) => {
    let result = ''
    if (dataSend.language === 'vi') {
        result =
            `
        <h3>Xin chào ${dataSend.patientName}!</h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên Booking Care</p>
        <p>Bạn vui lòng click vào đường link bên dưới để xác nhận email và tiếp tục thủ tục đang ký</p>
        <a href=${dataSend.redirectLink} target="_blank">Xác nhận địa chỉ email</a>
        <div>Xin chân thành cảm ơn!</div>
        `
    }
    if (dataSend.language === 'en') {
        result =
            `
        <h3>Dear ${dataSend.patientName}!</h3>
        <p>You received this email because you booked an online medical appointment on Booking Care</p>
        <p>please click on the link below to verify your email and continue the registration process.</p>
        <a href=${dataSend.redirectLink} target="_blank">Verify email</a>
        <div>Sincerely thank!</div>
        `
    }
    return result
}

module.exports = {
    sendSimpleEmail: sendSimpleEmail,
    sendAttachment: sendAttachment
}