import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from 'next/navigation'
import {encryptJWT, decryptJWT, UserJwtPayload} from "~/auth"
import { setToken } from "./utils/api";
import { COOKIE_NAME, cookieOptions } from "./server/api/utils/constants";


export async function logout() {
  cookies().set(COOKIE_NAME, "", { expires: new Date(0) });
}


export async function updateSession(request: NextRequest) {
  try {
    const session = request.cookies.get(COOKIE_NAME)?.value;
    if (request.nextUrl.pathname.startsWith('/login') && !session) {
      return;
    }
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const parsed = await decryptJWT(session) as UserJwtPayload;
    if (!parsed || !parsed?.id) {
      throw new Error("Failed to parse session");
    }

    if (request.nextUrl.pathname.startsWith('/login') && parsed?.id) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const token = await encryptJWT({id: parsed?.id}, "24 hrs");
    setToken(token.toString());

    const response = NextResponse.next();
    response.cookies.set(COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (err) {
    console.error("UPDATE Session error: ", err);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}