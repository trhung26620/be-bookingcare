import Web3 from "web3";
import db from "../models/index";
require('dotenv').config();
import emailService from './emailService';
import { v4 as uuidv4 } from 'uuid';
const { Op } = require("sequelize");
// const { BigNumber } = require("@ethersproject/bignumber");
const https = require('https');
// const BN = require('bn.js');
import compileFile from './HealthcarePayments.json'
import { loadContract } from './loadContract'

let buildUrlEmail = (doctorId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`
    return result;
}

function getExchangeRate() {
    return new Promise((resolve, reject) => {
        try {

            const options = {
                hostname: 'min-api.cryptocompare.com',
                path: '/data/price?fsym=ETH&tsyms=USD',
                method: 'GET',
            };
            const req = https.request(options, (res) => {
                let data = '';

                // A chunk of data has been recieved.
                res.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                res.on('end', () => {
                    try {
                        const rate = JSON.parse(data).USD;
                        resolve(rate);
                    } catch (error) {
                        reject(error)
                    }

                });
            });
            req.on("error", (err) => {
                reject(err);
            });
            req.end();
        } catch (error) {
            reject(error)
        }
    });
}

let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.timeType || !data.date || !data.fullName
                || !data.selectedGender || !data.address || !data.fullName
            ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            }
            else {
                let token = uuidv4();
                let user = await db.User.findOrCreate({
                    where: {
                        email: data.email
                    },
                    defaults: {
                        email: data.email,
                        roleId: 'R3',
                        gender: data.selectedGender,
                        address: data.address,
                        firstName: data.fullName
                    },
                })
                if (user && user[0]) {
                    let booking = await db.Booking.findOne({
                        where: {
                            [Op.and]: [
                                {
                                    patientId: user[0].id
                                },
                                {
                                    [Op.or]: [
                                        { statusId: 'S1' },
                                        { statusId: 'S2' }
                                    ]
                                }

                            ]
                        }
                    })
                    if (!booking) {
                        let billId = 'bill' + Math.floor(Math.random() * 100000).toString()
                        let priceTypeData = await db.Doctor_Infor.findOne({
                            where: {
                                doctorId: data.doctorId
                            },
                            attributes: [],
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] }
                            ],
                            raw: true,
                            nest: true
                        })
                        priceTypeData = priceTypeData.priceTypeData
                        let vnAmount = priceTypeData.valueVi
                        let enAmount = priceTypeData.valueEn
                        let exchangeRate = await getExchangeRate()
                        let ethAmount = parseFloat(enAmount) / exchangeRate;
                        let weiAmount = Web3.utils.toWei(ethAmount.toString(), 'ether');

                        await db.Bill.create(
                            {
                                billId: billId,
                                amount: enAmount,
                                weiAmount: weiAmount,
                                isPayment: false,
                                paidWei: '0'
                            }
                        )
                        await db.Booking.create({
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            token: token,
                            billId: billId,
                            isInitPayment: false
                        })
                        await emailService.sendSimpleEmail({
                            receiverEmail: data.email,
                            patientName: data.fullName,
                            time: data.timeString,
                            doctorName: data.doctorName,
                            language: data.language,
                            redirectLink: buildUrlEmail(data.doctorId, token)
                        })
                        console.log("Debug3")
                        resolve({
                            errCode: 0,
                            errMessage: 'Save infor doctor succeed!'
                        })

                    } else {
                        resolve({
                            errCode: 2,
                            errMessage: 'You have an unfinished appointment, please check your mail!'
                        })
                    }
                }
                // resolve({
                //     errCode: 2,
                //     errMessage: 'testing'
                // })




                // let result = await db.Booking.findOrCreate({
                //     where: {
                //         [Op.and]: [
                //             {
                //                 patientId: user[0].id
                //             },
                //             {
                //                 [Op.or]: [
                //                     { statusId: 'S1' },
                //                     { statusId: 'S2' }
                //                 ]
                //             }

                //         ]
                //     },
                //     defaults: {
                //         statusId: 'S1',
                //         doctorId: data.doctorId,
                //         patientId: user[0].id,
                //         date: data.date,
                //         timeType: data.timeType,
                //         token: token
                //     }
                // })
                // if (result[1] === true) {
                //     await emailService.sendSimpleEmail({
                //         receiverEmail: data.email,
                //         patientName: data.fullName,
                //         time: data.timeString,
                //         doctorName: data.doctorName,
                //         language: data.language,
                //         redirectLink: buildUrlEmail(data.doctorId, token)
                //     })
                //     resolve({
                //         errCode: 0,
                //         errMessage: 'Save infor doctor succeed!'
                //     })
                // } else {
                //     resolve({
                //         errCode: 2,
                //         errMessage: 'You have an unfinished appointment, please check your mail!'
                //     })
                // }
                // }
            }
        } catch (error) {
            reject(error)
        }
    })
}

let postVerifyBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        statusId: 'S1'
                    },
                    raw: false
                })
                if (appointment) {

                    // appointment.billId = 'S2';
                    // await appointment.save();

                    resolve({
                        errCode: 0,
                        errMessage: "ok"
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: "Appointment has been activated or does not exist"
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

let getDetailBillByToken = (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!token) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let data = await db.Booking.findOne({
                    where: {
                        token: token,
                    },
                    attributes: ['isInitPayment'],
                    include: [
                        // { model: db.Bill }
                        { model: db.Bill, attributes: ['billId', 'amount', 'weiAmount'] },
                        // as: 'billData',
                        // , attributes: ['billId', 'amount', 'weiAmount']
                    ],
                    raw: true,
                    nest: true
                })
                if (data) {
                    if (data.isInitPayment === false) {
                        let ethAmount = Web3.utils.fromWei("3143270258376815", "ether");
                        let exchangeRate = await getExchangeRate()
                        let usdAmount = parseFloat(ethAmount) * exchangeRate;
                        resolve({
                            errCode: 0,
                            errMessage: "ok",
                            data: {
                                isInitPayment: data.isInitPayment,
                                amount: usdAmount,
                                weiAmount: '3143270258376815',
                            }
                        })
                    } else {
                        let resData = { ...data.Bill }
                        resData.isInitPayment = data.isInitPayment
                        resolve({
                            errCode: 0,
                            errMessage: "ok",
                            data: resData
                        })
                    }
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: "Appointment has been activated or does not exist"
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

let getContractAbi = () => {
    return new Promise(async (resolve, reject) => {
        try {
            resolve({
                errCode: 0,
                errMessage: "ok",
                data: {
                    abi: compileFile.abi,
                    address: compileFile.networks["5777"].address
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

let transfer = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.signature) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
                // const contract = new web3.eth.Contract(compileFile.abi, compileFile.networks["5777"].address);
                // const billId = "bill73001";
                // const patientId = "patient6";
                // const paidAmount = web3.utils.toWei("1", "ether");
                // // const userAddress = web3.eth.personal.ecRecover(data, signature);

                // const rawTransaction = {
                //     from: userAddress,
                //     to: contractAddress,
                //     data: contract.methods.addFunds(billId, patientId).encodeABI(),
                //     value: paidAmount
                // };
                // const userAddress = Web3.eth.personal.ecRecover(data, data.signature);
            }
        } catch (error) {
            reject(error)
        }
    })
}

let initBill = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let token = data.token
                let contract = loadContract();
                let statusToken = await contract.methods.checkTokenStatus(token).call();
                if (statusToken === true) {
                    let data = await db.Booking.findOne({
                        where: {
                            token: token,
                        },
                        attributes: ['patientId'],
                        include: [
                            { model: db.Bill, attributes: ['billId', 'amount', 'weiAmount'] },
                            {
                                model: db.User, as: 'doctorIdBooking',
                                attributes: ['walletAddress'],
                            }
                        ],
                        raw: true,
                        nest: true
                    })
                    if (data) {
                        let _billId = data.Bill.billId;
                        // let _patientId = data.patientId;
                        let _amount = data.Bill.weiAmount;
                        let _doctorAccount = data.doctorIdBooking.walletAddress;
                        try {
                            let estimate = await contract.methods.updateBillData(token, _amount, _doctorAccount).estimateGas({
                                from: process.env.ACCOUNT_ADDRESS
                            });
                            await contract.methods.updateBillData(token, _amount,
                                _doctorAccount).send({
                                    from: process.env.ACCOUNT_ADDRESS,
                                    gas: estimate
                                })
                            await db.Booking.update({ isInitPayment: true }, {
                                where: {
                                    token: token
                                }
                            });
                            resolve({
                                errCode: 0,
                                errMessage: 'ok',
                                data: {
                                    billId: _billId,
                                    amount: data.Bill.amount,
                                    weiAmount: data.Bill.weiAmount
                                }
                            })
                        } catch (error) {
                            let stack = error.data.stack
                            let substring = "data for this token was updated!"
                            if (stack && stack.indexOf(substring) !== -1) {
                                let data = await db.Booking.findOne({
                                    where: {
                                        token: token
                                    },
                                    attributes: ['isInitPayment', 'statusId']
                                })
                                if (data) {
                                    if (data.isInitPayment === true && data.statusId === 'S1') {
                                        resolve({
                                            errCode: 4,
                                            errMessage: 'Data for this token was updated!',
                                        })
                                    } else {
                                        resolve({
                                            errCode: 3,
                                            errMessage: 'Something went wrong!',
                                        })
                                    }
                                }
                            } else {
                                resolve({
                                    errCode: 3,
                                    errMessage: 'Something went wrong!',
                                })
                            }
                        }

                    } else {
                        resolve({
                            errCode: 3,
                            errMessage: 'Something went wrong!',
                        })
                    }
                    // string memory _patientId,
                    // uint256 _amount,
                    // address _doctorAccount

                    // await contract.methods.updateBillData(data.walletAddress).send({
                    //     from: process.env.ACCOUNT_ADDRESS
                    // })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Invalid token!',
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

let verifyPayment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let contract = loadContract();
                try {
                    let billData = await contract.methods.getBillDataByToken(data.token).call();
                    if (billData && billData.isPayment === true) {
                        let bookingData = await db.Booking.findOne({
                            where: {
                                token: data.token
                            },
                            raw: false
                        })
                        if (bookingData && bookingData.statusId === 'S1') {
                            let _billId = bookingData.billId
                            bookingData.statusId = 'S2'
                            bookingData.save()
                            await db.Bill.update({ isPayment: true },
                                {
                                    where: { billId: _billId }
                                })
                            resolve({
                                errCode: 0,
                                errMessage: "ok",
                            })
                        } else {
                            resolve({
                                errCode: 3,
                                errMessage: 'Something went wrong!',
                            })
                        }

                    } else if (billData && billData.isPayment === false) {
                        resolve({
                            errCode: 4,
                            errMessage: "Bill not yet completed payment!",
                        })
                    } else {
                        resolve({
                            errCode: 3,
                            errMessage: 'Something went wrong!',
                        })
                    }
                } catch (error) {
                    resolve({
                        errCode: 3,
                        errMessage: 'Something went wrong!',
                    })
                }

            }
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment,
    getDetailBillByToken: getDetailBillByToken,
    verifyPayment: verifyPayment,
    getContractAbi: getContractAbi,
    transfer: transfer,
    initBill: initBill
}