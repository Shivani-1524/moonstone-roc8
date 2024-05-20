import NodeRSA from "node-rsa";
import { ZodIssue } from 'zod';
import { COOKIE_NAME, cookieOptions } from "./server/api/utils/constants";

export const RE_DIGIT = new RegExp(/^\d+$/);
export const EmailRegex = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
export const PasswordRegex = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()\-__+.])[A-Za-z\d!@#$%^&*()\-__+.]{6,}$/)
export const publicKey = process.env.NEXT_PUBLIC_RSASECRET;


export function encryptDataRSA(data: string) {
    if (!publicKey) {
        throw new Error('Public Key is not defined');
    }
  
    const key_public = new NodeRSA(publicKey);
    const encrypted_data = key_public.encrypt(data, 'base64');
    return encrypted_data;
  }

  export const validateForm = (Issues : ZodIssue[]) => {
   
    const errors: Record<string, string>= {};
      Issues.forEach(zodError => {
        const path = zodError.path[0]
        if (path && !(path in errors)) {
          errors[path] = zodError.message;
        }
      })
      return errors
  }
