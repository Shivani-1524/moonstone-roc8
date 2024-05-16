import { z } from "zod";
import { randomInt } from "crypto";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {addMinutesToDate, decryptDataRSA, formatDateTime} from "../utils/helpers";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { TRPCError } from "@trpc/server";
import { encryptJWT, encryptHs256SignJWT, verifyHs256SignJWT, EmailJwtPayload } from "~/auth"; 
import { loginUserSchema, createUserSchema, otpVerifySchema } from "~/types";
import { api, getBaseUrl } from "~/utils/api";
import cookie from 'cookie';
import { PasswordRegex } from "~/helpers";
import { jwtDecrypt } from "jose";
import jwt from 'jsonwebtoken';
import {
  transporter,
  cookieOptions,
  mailOptions,
  OTP_MAX_VALUE,
  OTP_MIN_VALUE,
  OTP_EXPIRATION_MINUTES,
  OTP_RESEND_DELAY_MINUTES,
  JWT_EMAIL_VERIFICATION_EXPIRY,
  JWT_EXPIRATION,
  COOKIE_NAME
} from "../utils/constants";




const verificationCodeResendSchema = z.object({
  email: z.string()
});




export const usersRouter = createTRPCRouter({
  // getAll: publicProcedure.query(({ctx}) => {
  //   return ctx.db.user.findMany();
  // }),

  //get user by id
  // getOne: publicProcedure
  //   .input(idSchema)
  //   .query(({ input, ctx }) => {
  //     return ctx.db.user.findUnique({
  //       where: idSchema.parse(input),
  //     });
  //   }),

  //create user
  createUser: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      const {email, name, password} = input
      console.log("I AM HIT, TARGET HOT");
      
      const now = new Date()

      const isUserPresent = await ctx.db.user.findUnique({
        where: {
          email: email
        },
      });
      console.log("I AM PAST 70");


      if(isUserPresent && isUserPresent?.emailVerified){
        throw new TRPCError({code: "BAD_REQUEST", message: "Account Already Exists please login"})
      }
      // else if(isUserPresent && isUserPresent?.otpAttemptCounter > 15){
      //     throw new Error("too many sign up attempts, your account has been blocked. please contact admin.")
      // }

      else if (isUserPresent && (isUserPresent?.otpResendTimer > now || isUserPresent.otpAttemptTimer > now)) {
        const nextAvailableTime = isUserPresent.otpResendTimer > isUserPresent.otpAttemptTimer ? isUserPresent.otpResendTimer : isUserPresent.otpAttemptTimer;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Multiple OTP resend attempts made. Please wait for the OTP timer to end. Try again after: ${formatDateTime(nextAvailableTime)}`
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

      //update existing entry
      const token = encryptHs256SignJWT({email: isUserPresent?.email || newUser?.email}, JWT_EMAIL_VERIFICATION_EXPIRY)
      const url = `${getBaseUrl()}/auth/${token}`

      const currentMailOptions = {...mailOptions, 
        to: [email],   
        subject: "Email Verification", 
        text: `Please find your OTP: ${otp}. Note that the given otp expires in 15 minutes.`, // plain text body
        html: `<b>Please find your OTP: ${otp} </b><p>Go to this <a href=${url}>link</a> incase you missed the OTP verification website </p><p>Note that given OTP expires in 15 minutes</p> `, // html body}
      }
    
      transporter.sendMail(currentMailOptions, (error, info) => {
        if(error){
          console.log(error)
          throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: `Unexpected Error Ocurred while sending the email - ${error?.message}`})
        }else{
          console.log('Email sent: ' +info.response)
        }
      })

      
      return {otpToken: token}

      
    }),

    loginUser: publicProcedure
    .input(loginUserSchema)
    .mutation(async ({input, ctx}) => {
      const {email, password} = input

      const isUserPresent = await ctx.db.user.findUnique({
        where: {
          email: email
        },
      });

      if(!isUserPresent){
        throw new TRPCError({code: 'UNAUTHORIZED', message: "Looks like you are not registered yet. Please sign up!"})
      }

      const now = new Date()
      // const otpExpiresAt = addMinutesToDate(now, 15)

      if(isUserPresent.passwordAttemptCounter >= 5 && isUserPresent.unblocksUserAt > now){
        
        throw new TRPCError({code: 'UNAUTHORIZED', message: `Please wait for the timer to end. trying again after ${formatDateTime(isUserPresent.unblocksUserAt)}`})
      }

      const decryptedPassword = decryptDataRSA(password)
      const isMatch = await bcrypt.compare(decryptedPassword, isUserPresent.password);

      if (!isMatch && isUserPresent.passwordAttemptCounter < 5 ) {
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
      
      else if (!isMatch && isUserPresent.passwordAttemptCounter >= 5 ) {
       const timer = addMinutesToDate(now, 5)
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
        throw new TRPCError({code: 'UNAUTHORIZED', message: 'we will be unblocking your account after 5 minutes. Please try again after the timer.'})
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
      ctx.res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, token, cookieOptions))

      return {token}
      

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
        throw new TRPCError({code: "UNAUTHORIZED", message: "Otp Resend Timer has not ended yet. Please try again later!"})
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
      console.log(getBaseUrl(), "FITT CHECK")
      const url = `${getBaseUrl()}/auth/${token}`

      
      const currentMailOptions = {...mailOptions, 
        to: [email],   
        subject: "Resent Email Verification", 
        text: `Please find your OTP: ${otp}. Note that the given otp expires in 15 minutes.`, // plain text body
        html: `<b>Please find your OTP: ${otp} </b><p>Go to this <a href=${url}>Link</a> incase you missed the OTP verification website </p><p>Note that given OTP expires in 15 minutes</p>`, // html body}
      }

      transporter.sendMail(currentMailOptions, (error, info) => {
        if(error){
          console.log(error)
          throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: `Unexpected Error Ocurred while sending the email - ${error?.message}`})
        }else{
          console.log('Resend otp Email sent: ' +info.response)
        }
      })


    }),

  verifyOtp: publicProcedure
  .input(otpVerifySchema)
  .mutation(async ({input, ctx}) => {
    const {otp, token} = input
    const {email} = jwt.decode(token) as EmailJwtPayload
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
    if(isUserPresent?.otpAttemptCounter >= 5 && isUserPresent.otpAttemptTimer > now ){
      throw new TRPCError({code:"UNAUTHORIZED", message: `You have attempted to enter your OTP for more than 5 times, please try again after ${formatDateTime(isUserPresent.otpAttemptTimer)}`})
    }
    else if(isUserPresent?.otpExpiresAt < now){
      throw new TRPCError({code:"UNAUTHORIZED", message: "Your OTP has expired, please try again"})
    }
    
    const decryptedOtp = decryptDataRSA(otp)
    const isOtpMatch = await bcrypt.compare(decryptedOtp, isUserPresent?.otp);

    if (!isOtpMatch && isUserPresent?.otpAttemptCounter < 5 ) {
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
    else if(!isOtpMatch && isUserPresent?.otpAttemptCounter >= 5){
      const timer = addMinutesToDate(now, 5)
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
      res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, token, cookieOptions))

      return {token}

    }else{
      throw new TRPCError({code: 'INTERNAL_SERVER_ERROR'})
    }
  })

})