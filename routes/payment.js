const express = require('express');
var paymentRouter = express.Router();
var Config = require('../config');
var request= require('request');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId
var Payment = require('../models/payment');
var BookTest = require('../models/bookTest');
var crypto = require('crypto');

// Middlewares
function isauthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.messages.push(["Please login to access this page", "blue"])
        req.session.next = req.originalUrl;
        return res.redirect('/login');
    }
    next();
}

function complete_payment(payment_id, callback) {
    Payment.findOne({"payment_id": payment_id}).populate("book_id").exec((err, payment)=>{
        if (err){
            console.error(err);
            return callback(err, null)
        }
        if (!payment){
            let error = new Error("No Payment Found");
            return callback(error, null)
        }
        else if (payment.completed){
            console.error('Payment already done');
            return callback(null, payment);
        }
        else{
            payment.completed = true;
            payment.status = "Completed";
            payment.save((err, pay)=>{
                if(err){
                    console.error(err);
                    return callback(err, null);
                }
                payment.book_id.payment_done = true;
                payment.book_id.status = "PENDING";
                payment.book_id.payment = payment._id;
                payment.book_id.save((err, pay)=> {
                    if (err){
                        console.error(err);
                        return callback(err, null)
                    }
                    return callback(null, payment)
                })
            })
        }
    })

}
// Middlewares

paymentRouter.post('/create-request', isauthenticated, (req, res, next) => {
    let data = req.body;
    let amount = '10';
    Payment.findOne({"book_id": new ObjectId(data.book_id)}, (err, payment)=> {
        if (payment){
            return res.redirect("https://www.instamojo.com/@joblanatest/" + payment.payment_id);
        }
        else{
            var headers = { 'X-Api-Key': Config.instamojo.API_KEY, 'X-Auth-Token': Config.instamojo.AUTH_KEY}
            var payload = {
                    purpose: data.purpose,
                    amount: amount,
                    phone: req.user.phoneno,
                    buyer_name: req.user.fullname,
                    redirect_url: Config.REQ_PROTOCOL + "://" + Config.REQ_HOST + "/payment/redirect",
                    send_email: true,
                    webhook: Config.REQ_PROTOCOL + "://" + Config.REQ_HOST + "/payment/webhook",
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
                    console.error(body);
                    res.locals.messages.push(["Some Error occured", "red"]);
                    return res.redirect('/user/profile');
                }
            })
        }
    })

});

paymentRouter.post('/webhook', (req, res, next) => {
    dct = req.body;
    let mac = dct.mac;
    delete dct.mac;
    let key_lst = Object.keys(dct).sort();
    let val_lst = [];
    key_lst.forEach(item=>{
        val_lst.push(dct[item])
    });
    let payload = val_lst.join('|');
    let signature_calc = crypto.createHmac('sha1', Config.instamojo.SALT_KEY).update(payload).digest('hex')
    if (signature_calc == mac) {
        if (dct.status == "Credit"){
            complete_payment(dct.payment_request_id, (err, pay)=>{
                if (err){
                    console.error(err);
                    res.locals.messages.push([err.message, "red"]);
                    return res.redirect("/user/profile")
                }
                res.locals.messages.push(["Your Payment is successful", "green"]);
                return res.redirect("/user/profile");
            });
        }
        else {
            console.error(req.body);
            return res.send({status: 200})
        }
    }
    else {
        console.error("Wrong webhook authorization");
        return res.send({status: 200})
    }
    return res.send({status: 200});
});

paymentRouter.get('/redirect', (req, res, next) => {
    var headers = { 'X-Api-Key': Config.instamojo.API_KEY, 'X-Auth-Token': Config.instamojo.AUTH_KEY}
    id = req.query.payment_request_id
    request.get('https://www.instamojo.com/api/1.1/payment-requests/' + id , {headers: headers}, function(error, response, body){
        if(!error && response.statusCode == 200){
            let body_json = JSON.parse(body);
            if (body_json.payment_request.status == "Completed" && body_json.payment_request.payments[0].status == "Credit"){
                complete_payment(id, (err, pay)=>{
                    if (err){
                        console.error(err);
                        res.locals.messages.push([err.message, "red"]);
                        return res.redirect("/user/profile")
                    }
                    res.locals.messages.push(["Your Payment is successful", "green"]);
                    return res.redirect("/user/profile");
                });
            }
            else{
                res.locals.messages.push(["Some Problem in payment processing", "red"]);
                return res.redirect("/user/profile");
            }
        }
    })    
});


module.exports = paymentRouter;