import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from 'next/navigation'
import {encryptJWT, decryptJWT} from "~/auth"
import { setToken } from "./utils/api";



export async function logout() {
  cookies().set("moonstone-session", "", { expires: new Date(0) });
  localStorage.removeItem("access-token");
}

export async function getSession() {
  try{
    const session = cookies().get("moonstone-session")?.value;
    if (!session) return null;
    return await decryptJWT(session);
  }catch(err){
    console.log("GET Session error: ",err)
    redirect('/login')
  }

}

export async function updateSession(request: NextRequest) {
  try {
    const session = request.cookies.get("moonstone-session")?.value;
    if (request.nextUrl.pathname.startsWith('/login') && !session) {
      return;
    }
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const parsed = await decryptJWT(session);
    if (!parsed) {
      throw new Error("Failed to parse session");
    }

    if (request.nextUrl.pathname.startsWith('/login') && parsed) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    parsed.expires = expires;

    const token = await encryptJWT(parsed, parsed.expires);
    setToken(token.toString());

    const response = NextResponse.next();
    response.cookies.set("moonstone-session", token, {
      httpOnly: true,
      expires: parsed.expires,
    });

    return response;
  } catch (err) {
    console.error("UPDATE Session error: ", err);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}