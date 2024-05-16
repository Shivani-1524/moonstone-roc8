import nodemailer from "nodemailer";


export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_FROM_NAME = "Moonstone";
export const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM;


// OTP Configuration
export const OTP_MIN_VALUE = 10000000;
export const OTP_MAX_VALUE = 99999999;
export const OTP_EXPIRATION_MINUTES = 15;
export const OTP_RESEND_DELAY_MINUTES = 3;

export const JWT_EMAIL_VERIFICATION_EXPIRY = '1d';
export const JWT_EXPIRATION = '1 day';
export const COOKIE_NAME = 'moonstone-session';


export const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

export const cookieOptions = {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === "production"
  }

export const mailOptions = {
    from: {
      name: "Moonstone",
      address: EMAIL_FROM_ADDRESS ?? "default@example.com" 
    },
  }
  