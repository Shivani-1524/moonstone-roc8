import type { inferRouterOutputs } from "@trpc/server";
import {z} from "zod";
import type { AppRouter } from "./server/api/root";

type RouterOutputs = inferRouterOutputs<AppRouter>
type allCategoriesOutput = RouterOutputs["category"]["getAll"]

export type Category = allCategoriesOutput["categories"][number]

export const loginUserSchema =  z.object({
    email: z.string().min(1, { message: "Email is Required" }).email("This is an invalid Email"),
    password: z.string().min(1, {message: "Password is Required"}),
  })

export const createUserSchema = z.object({
    name: z.string().min(1, { message: "Name is Required" }),
    email: z.string().min(1, { message: "Email is Required" }).email("This is an invalid Email"),
    password: z.string().min(1, {message: "Password is Required"}),
  })
  
  const validateEightDigitNumber = (num: number) => {
    const numString = String(num);
    return numString.length === 8 && !isNaN(num);
  };

export const otpVerifySchema = z.object({
    otp: z.string().min(1, { message: "Otp is Required" }),
    // email: z.string().min(1, { message: "Email is Required" }).email("This is an invalid Email"),
    token: z.string().min(1, { message: "Token is Required" })
  })


export const idSchema = z.object({
  id: z.string()
})