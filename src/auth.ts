import { JWTPayload, jwtVerify, SignJWT } from "jose";
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;
const jwtAccessToken = process.env.ACCESS_TOKEN_SECRET;
const key = new TextEncoder().encode(secretKey);

export interface UserJwtPayload {
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


export async function decryptJWT(input: string): Promise<UserJwtPayload> {
    try{
      const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
      });
      return payload as unknown as UserJwtPayload;
    }
    catch(err){
      throw new Error("Token has Expired")
    }
  }

  export async function encryptJWT(payload: UserJwtPayload | {id : string}, expiryTime: string) {
    return await new SignJWT(payload as JWTPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiryTime)
      .sign(key);
  }

  export function encryptHs256SignJWT(payload: { email : string}, expiryTime: string){
    if(!jwtAccessToken){
      throw new Error("Token has Expired")
    }
    return jwt.sign(payload, jwtAccessToken, {expiresIn: expiryTime} )
  }
