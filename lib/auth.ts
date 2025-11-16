import {cookies} from "next/headers";
import {jwtVerify, SignJWT} from "jose";

type AuthTokenPayload = {
    role: 'admin';
    iat?: number;
    exp?: number;
};

const getSessionSecret = () => {
    const secret = process.env.SESSION_SECRET;
    
    if (!secret) {
        throw new Error("SESSION_SECRET is not set");
    }
    
    return new TextEncoder().encode(secret);
};

const getJwtExpirationTime = () => {
    const expirationTime = process.env.JWT_EXPIRATION_TIME_SECONDS;
    
    if (!expirationTime) {
        throw new Error("JWT_EXPIRATION_TIME_SECONDS is not set");
    }
    
    return parseInt(expirationTime);
};

export const signAdminAuthToken = async (): Promise<string> => {
    const secretKey = getSessionSecret();
    const expirationTime = getJwtExpirationTime();
    const now = Math.floor(Date.now() / 1000);

    return new SignJWT({role: 'admin'})
    .setProtectedHeader({alg: "HS256", typ: 'JWT'})
    .setIssuedAt(now)
    .setExpirationTime(now + expirationTime)
    .sign(secretKey);
}

const verifyAdminAuthToken = async (token: string): Promise<AuthTokenPayload | null> => {
    const secretKey = getSessionSecret();
    const {payload} = await jwtVerify(token, secretKey);
    
    if (!payload || payload.role !== 'admin') {
        return null;
    }

    return {
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp,
    };
};

export const setAdminAuthCookie = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set(process.env.AUTH_COOKIE_NAME!, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'lax',
        path: '/',
        maxAge: getJwtExpirationTime(),
    });
};

export const clearAdminAuthCookie = async () => {
    const cookieStore = await cookies();
    cookieStore.delete(process.env.AUTH_COOKIE_NAME!);
};

export const isAdminAuthenticated = async (): Promise<boolean> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.AUTH_COOKIE_NAME!)?.value;
    
    if (!token) {
        return false;
    }

    try {
        const payload = await verifyAdminAuthToken(token);
        return payload !== null;
    } catch (error) {
        console.error("Error verifying admin authentication token", error);
        return false;
    }
};