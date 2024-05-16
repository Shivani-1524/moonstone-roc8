import { NextRequest } from "next/server";
import { updateSession } from "./lib";
import { setToken } from "./utils/api";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ['/', '/login', '/home'],
}