import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from 'next/navigation'
import {encryptJWT, decryptJWT, UserJwtPayload} from "~/auth"
// import { setToken } from "./utils/api";
import { COOKIE_NAME, cookieOptions, JWT_EXPIRATION } from "./server/api/utils/constants";


export async function updateSession(request: NextRequest) {
  try {
    const session = request.cookies.get(COOKIE_NAME)?.value;

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const parsed = await decryptJWT(session);
    if (!parsed?.id) {
      throw new Error("Failed to parse session");
    }

    const token = await encryptJWT({id: parsed?.id}, JWT_EXPIRATION);
    // setToken(token.toString());

    const response = NextResponse.next();
    response.cookies.set(COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (err) {
    console.error("UPDATE Session error: ", err);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}