import { z } from "zod";
import { randomInt } from "crypto";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {addMinutesToDate, decryptDataRSA} from "../utils/helpers";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { encryptJWT, encryptHs256SignJWT, EmailJwtPayload } from "~/auth"; 
import { loginUserSchema, createUserSchema, otpVerifySchema } from "~/types";
import { getBaseUrl } from "~/utils/api";
import cookie from 'cookie';
import { PasswordRegex } from "~/helpers";
import jwt from 'jsonwebtoken';
import {
  cookieOptions,
  OTP_MAX_VALUE,
  OTP_MIN_VALUE,
  OTP_EXPIRATION_MINUTES,
  OTP_RESEND_DELAY_MINUTES,
  JWT_EMAIL_VERIFICATION_EXPIRY,
  JWT_EXPIRATION,
  COOKIE_NAME,
  TIMER_5_MIN,
  ATTEMPTS_5_COUNT
} from "../utils/constants";
import { transporter, mailOptions } from "../utils/helpers";



const verificationCodeResendSchema = z.object({
  email: z.string()
});




export const usersRouter = createTRPCRouter({

  createUser: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      const {email, name, password} = input
      
      const now = new Date()

      const isUserPresent = await ctx.db.user.findUnique({
        where: {
          email: email
        },
      });
      if(isUserPresent?.emailVerified){
        throw new TRPCError({code: "BAD_REQUEST", message: "Account Already Exists please login"})
      }
      // else if(isUserPresent && isUserPresent?.otpAttemptCounter > 15){
      //     throw new Error("too many sign up attempts, your account has been blocked. please contact admin.")
      // }

      else if (isUserPresent && (isUserPresent?.otpResendTimer > now || isUserPresent.otpAttemptTimer > now)) {
        const nextAvailableTime = isUserPresent.otpResendTimer > isUserPresent.otpAttemptTimer ? isUserPresent.otpResendTimer : isUserPresent.otpAttemptTimer;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Multiple OTP resend attempts made. Please wait for the OTP timer to end. Try again after: UTCTIMER ${nextAvailableTime.toString()}`
        })
      }
      const otp = randomInt(OTP_MIN_VALUE, OTP_MAX_VALUE)
      const otpExpiresAt = addMinutesToDate(now, OTP_EXPIRATION_MINUTES)
      const otpResendTimer = addMinutesToDate(now, OTP_RESEND_DELAY_MINUTES)
      const salt = await bcrypt.genSalt(10);
      const decryptedPassword = decryptDataRSA(password)
      if(!PasswordRegex.test(decryptedPassword)){
        throw new TRPCError({code: "BAD_REQUEST", message: "password needs to contain atleast 6 characters, one special character and one digit"})
      }
      const hashedPassword = await bcrypt.hash(decryptedPassword, salt);
      const hashedOtp = await bcrypt.hash(otp.toString(), salt);
      let newUser = null
      if(!isUserPresent){
      newUser = await ctx.db.user.create({
          data: {
            email: email,
            name: name,
            password: hashedPassword,
            otpResendTimer: otpResendTimer,
            otp: hashedOtp,
            otpExpiresAt: otpExpiresAt,
          },
        });
      }else{
        await ctx.db.user.update({
          where:{
            email: email
          },
          data: {
            name: name,
            password: hashedPassword,
            otp: hashedOtp,
            otpResendTimer: otpResendTimer,
            otpExpiresAt: otpExpiresAt,
            otpAttemptCounter: { increment: 1 },
          },
        });
      }                

      if(!isUserPresent?.email && !newUser?.email){
        throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Unexpected Error Ocurred while creating the user"})
      }

      await transporter.verify();

      //update existing entry
      const token = encryptHs256SignJWT({email: isUserPresent?.email ?? newUser?.email ?? ""}, JWT_EMAIL_VERIFICATION_EXPIRY)
      const url = `${getBaseUrl()}/auth/${token}`

      const currentMailOptions = {...mailOptions, 
        to: [email],   
        subject: "Email Verification", 
        text: `Please find your OTP: ${otp}. Note that the given otp expires in 15 minutes.`, // plain text body
        html: `<b>Please find your OTP: ${otp} </b><p>Go to this <a href=${url}>link</a> incase you missed the OTP verification website </p><p>Note that given OTP expires in 15 minutes</p> `, // html body}
      }
    
      await transporter.sendMail(currentMailOptions)
      
      return {otpToken: token}

      
    }),

    logoutUser: publicProcedure.mutation((async ({ctx}) => {
      ctx.res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, '', {
        ...cookieOptions,
        expires: new Date(0)
      }))
    })),

    loginUser: publicProcedure
    .input(loginUserSchema)
    .mutation(async ({input, ctx}) => {
      const {email, password} = input

      const isUserPresent = await ctx.db.user.findUnique({
        where: {
          email: email
        },
      });

      if(!isUserPresent?.emailVerified){
        throw new TRPCError({code: 'UNAUTHORIZED', message: "Looks like you are not registered yet. Please sign up!"})
      }

      const now = new Date()

      if(isUserPresent.passwordAttemptCounter >= TIMER_5_MIN && isUserPresent.unblocksUserAt > now){
        
        throw new TRPCError({code: 'UNAUTHORIZED', message: `Please wait for the timer to end. trying again after UTCTIMER ${isUserPresent.unblocksUserAt.toString()}`})
      }

      const decryptedPassword = decryptDataRSA(password)
      const isMatch = await bcrypt.compare(decryptedPassword, isUserPresent.password);

      if (!isMatch && isUserPresent.passwordAttemptCounter < ATTEMPTS_5_COUNT ) {
        await ctx.db.user.update({
          where:{
            email: email
          },
          data: {
            passwordAttemptCounter: {
              increment: 1
            }
          },
        });
        throw new TRPCError({code: 'UNAUTHORIZED', message: 'Incorrect credentials. please try again!'})

      }
      
      else if (!isMatch && isUserPresent.passwordAttemptCounter >= ATTEMPTS_5_COUNT ) {
       const timer = addMinutesToDate(now, TIMER_5_MIN)
        await ctx.db.user.update({
          where:{
            email: email
          },
          data: {
            passwordAttemptCounter: {
              increment: 1
            },
            unblocksUserAt: timer
          },
        })
        throw new TRPCError({code: 'UNAUTHORIZED', message: `multiple attempts were made to sign in, please try again after UTCTIMER ${timer.toString()} `})
      }

      await ctx.db.user.update({
        where:{
          email: email
        },
        data: {
          passwordAttemptCounter: 0,
          unblocksUserAt: now,
        },
      });
      const token = await encryptJWT({id: isUserPresent.id}, JWT_EXPIRATION)
      const nameToken = encryptHs256SignJWT({name: isUserPresent.name},  JWT_EMAIL_VERIFICATION_EXPIRY)
      ctx.res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, token,  cookieOptions))

      return {nameToken}
      
    }),
    

  //update user - not changing the frontend from the figma design so this api has not been used:
  updateVerificationCode: publicProcedure
    .input(verificationCodeResendSchema)
    .mutation(async ({ input, ctx }) => {

      const {email} = input
      const now = new Date()
      
      const isUserPresent = await ctx.db.user.findUnique({
        where: {
          email: email
        },
      });

      if(!isUserPresent){
        throw new TRPCError({code: "UNAUTHORIZED", message: "Invalid Access, User not present"})
      }
      else if( isUserPresent.emailVerified){
        throw new TRPCError({code: "BAD_REQUEST", message: "You have signed up successfully already, please log in instead"})
      }
      else if(isUserPresent.otpResendTimer > now ){
        throw new TRPCError({code: "UNAUTHORIZED", message: `Otp Resend Timer has not ended yet. Please try again after UTCTIMER ${isUserPresent.otpResendTimer.toString()} !`})
      }

      const otpResendTimer = addMinutesToDate(now, OTP_RESEND_DELAY_MINUTES)
      const otp = randomInt(OTP_MIN_VALUE, OTP_MAX_VALUE)
      const otpExpiresAt = addMinutesToDate(now, OTP_EXPIRATION_MINUTES)
      const salt = await bcrypt.genSalt(10);
      const hashedOtp = await bcrypt.hash(otp.toString(), salt);

      await ctx.db.user.update({
        where: {
          email: email,
        },
        data: {
          otpAttemptCounter:0,
          otp: hashedOtp,
          otpExpiresAt: otpExpiresAt,
          otpResendTimer: otpResendTimer
        },
      });

      const token = encryptHs256SignJWT({email: isUserPresent?.email} , JWT_EMAIL_VERIFICATION_EXPIRY)
      const url = `${getBaseUrl()}/auth/${token}`

      
      const currentMailOptions = {...mailOptions, 
        to: [email],   
        subject: "Resent Email Verification", 
        text: `Please find your OTP: ${otp}. Note that the given otp expires in 15 minutes.`, // plain text body
        html: `<b>Please find your OTP: ${otp} </b><p>Go to this <a href=${url}>Link</a> incase you missed the OTP verification website </p><p>Note that given OTP expires in 15 minutes</p>`, // html body}
      }

      await transporter.sendMail(currentMailOptions)


    }),

  verifyOtp: publicProcedure
  .input(otpVerifySchema)
  .mutation(async ({input, ctx}) => {
    const {otp, token} = input;

    const result = jwt.decode(token) as EmailJwtPayload
    if(!result){
      throw new TRPCError({code: "UNAUTHORIZED", message: "invalid token, please sighnup again"})
    }
    const {email} = result
    const {res} = ctx
    
    const isUserPresent = await ctx.db.user.findUnique({
      where: {
        email: email
      },
    });
    if(!isUserPresent){
      throw new TRPCError({code:"UNAUTHORIZED", message: "Invalid API Access"})
    }

    const now = new Date()
    if(isUserPresent?.otpAttemptCounter >= ATTEMPTS_5_COUNT && isUserPresent.otpAttemptTimer > now ){
      throw new TRPCError({code:"UNAUTHORIZED", message: `You have attempted to enter your OTP for more than 5 times, please try again after UTCTIMER ${isUserPresent.otpAttemptTimer.toString()}`})
    }
    else if(isUserPresent?.otpExpiresAt < now){
      throw new TRPCError({code:"UNAUTHORIZED", message: "Your OTP has expired, please sign up again"})
    }
    
    const decryptedOtp = decryptDataRSA(otp)
    const isOtpMatch = await bcrypt.compare(decryptedOtp, isUserPresent?.otp);

    if (!isOtpMatch && isUserPresent?.otpAttemptCounter < ATTEMPTS_5_COUNT ) {
      await ctx.db.user.update({
        where:{
          email: email
        },
        data: {
          otpAttemptCounter: {
            increment: 1
          }
        },
      });
      throw new TRPCError({code: "UNAUTHORIZED", message: "Incorrect OTP. please try again!"})
    }
    else if(!isOtpMatch && isUserPresent?.otpAttemptCounter >= ATTEMPTS_5_COUNT){
      const timer = addMinutesToDate(now, TIMER_5_MIN)
      await ctx.db.user.update({
        where:{
          email: email
        },
        data: {
          otpAttemptCounter: {
            increment: 1
          },
          otpAttemptTimer: timer
        },
      });
      throw new TRPCError({code: "UNAUTHORIZED", message: "You OTP is incorrect, please try again after 5 minutes"})
    }else if(isOtpMatch){
      await ctx.db.user.update({
        where:{
          email: email
        },
        data: {
          emailVerified: true,
          otpAttemptCounter: 0,
        },
      });

      const token = await encryptJWT({id: isUserPresent.id}, JWT_EXPIRATION)
      const nameToken = encryptHs256SignJWT({name: isUserPresent.name},  JWT_EMAIL_VERIFICATION_EXPIRY)
      res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, token, cookieOptions))

      return {nameToken}

    }else{
      throw new TRPCError({code: 'INTERNAL_SERVER_ERROR'})
    }
  })

})