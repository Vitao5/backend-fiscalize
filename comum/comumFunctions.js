const { v4: uuidv4 } = require('uuid'); 
const jwt = require('jsonwebtoken');
const process = require('process');
require("dotenv").config();
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const crypto = require('crypto');


function generateId(){
    return uuidv4();
}

function isNullorEmpty(value){
    if(value === null || value === undefined || value === ''){
        return true;
    }
}

function getUserMoment(req){
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
}

function isRootSystem(id){
    if(id == process.env.ROOT_SYSTEM){
        return true;
    }else{
        return false;
    }
}

function codeSixDigits() {
    return crypto.randomInt(100000, 1000000).toString();
}


async function sendMail(email, texto) {
  const { data, error } = await resend.emails.send({
    from: 'Fiscalize <onboarding@resend.dev>',
    to: [email],
    subject: 'Seu código Fiscalize Finanças',
    html: texto,
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
}


module.exports = {
    generateId,
    isNullorEmpty,
    getUserMoment,
    isRootSystem,
    codeSixDigits,
    sendMail
};
