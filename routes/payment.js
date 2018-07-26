const express = require('express');
var paymentRouter = express.Router();
var Config = require('../config');
var request= require('request');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId
var Payment = require('../models/payment');

// Middlewares
function isauthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.messages.push(["Please login to access this page", "blue"])
        req.session.next = req.originalUrl;
        return res.redirect('/login');
    }
    next();
}
// Middlewares

paymentRouter.post('/create-request', isauthenticated, (req, res, next) => {
    let data = req.body;
    let amount = '10';
    Payment.findOne({"book_id": new ObjectId(data.book_id)}, (err, payment)=> {
        if (payment){
            console.log('booked already');
            return res.redirect("https://www.instamojo.com/@joblanatest/" + payment.payment_id);
        }
        else{
            var headers = { 'X-Api-Key': Config.instamojo.API_KEY, 'X-Auth-Token': Config.instamojo.AUTH_KEY}
            var payload = {
                    purpose: data.purpose,
                    amount: amount,
                    phone: req.user.phoneno,
                    buyer_name: req.user.fullname,
                    redirect_url: Config.REQ_PROTOCOL + "://" + Config.REQ_HOST + "/user/profile",
                    send_email: true,
                    webhook: Config.REQ_PROTOCOL + "://" + Config.REQ_HOST + "/payment/webook",
                    send_sms: false,
                    email: req.user.email,
                    allow_repeated_payments: false
                }
            let newPayment = new Payment({
                user: req.user._id,
                amount: amount,
                test_id: new ObjectId(data.test_id),
                book_id: new ObjectId(data.book_id),
                completed: false
            });
            request.post('https://www.instamojo.com/api/1.1/payment-requests/', {form: payload,  headers: headers}, function(error, response, body){
                if(!error && response.statusCode == 201){
                    let body_json = JSON.parse(body);
                    newPayment.payment_id = body_json["payment_request"]["id"]
                    newPayment.status = body_json["payment_request"]["status"]
                    newPayment.save((err, payment) => {
                        if (err) {
                            console.error(err);
                            res.locals.messages.push(["Some Error occured", "red"]);
                            return res.redirect('/user/profile');
                        }
                        return res.redirect(body_json.payment_request.longurl);
                    })
                }
                else {
                    console.log(body);
                    res.locals.messages.push(["Some Error occured", "red"]);
                    return res.redirect('/user/profile');
                }
            })
        }
    })

});

paymentRouter.post('/webhook', (req, res, next) => {
    console.log(req.body);
    console.log(req.headers);
    res.send({status: 200});
});
module.exports = paymentRouter;