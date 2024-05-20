




// OTP Configuration
export const OTP_MIN_VALUE = 10000000;
export const OTP_MAX_VALUE = 99999999;
export const OTP_EXPIRATION_MINUTES = 15;
export const OTP_RESEND_DELAY_MINUTES = 3;

export const JWT_EMAIL_VERIFICATION_EXPIRY = '1d';
export const JWT_EXPIRATION = '1 day';
export const COOKIE_NAME = 'moonstone-session';



export const cookieOptions = {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }


  