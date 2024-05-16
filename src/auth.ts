import { jwtVerify, SignJWT, jwtDecrypt } from "jose";
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;
const jwtAccessToken = process.env.ACCESS_TOKEN_SECRET;
const key = new TextEncoder().encode(secretKey);
console.log(secretKey, jwtAccessToken, "bruh")

interface UserJwtPayload {
    id: string
    jti: string
    iat: number
    exp: number
  }

export interface EmailJwtPayload {
    email: string
    iat: number
    exp: number
  }

export async function decryptJWT(input: string): Promise<any> {
    try{
      console.log("in dec jet",secretKey)
      console.log("in key jwt ",key)
      console.log(key)
      const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
      });
      return payload as any as UserJwtPayload;
    }
    catch(err){
      //redirect to login and show error toast
      console.log('session has expired', err)
      throw new Error("Token has Expired")
    }
  }

  export async function encryptJWT(payload: any, expiryTime: string) {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiryTime)
      .sign(key);
  }

  export function encryptHs256SignJWT(payload: any, expiryTime: string){
    if(!jwtAccessToken){
      throw new Error("Token has Expired")
    }
    return jwt.sign(payload, jwtAccessToken, {expiresIn: expiryTime} )

  }

  export async function verifyHs256SignJWT(token: any){
    if(!jwtAccessToken){
      throw new Error("Token has Expired")
    }
    return jwt.verify(token, jwtAccessToken ) as any as EmailJwtPayload
  }