import { JWTPayload, TokenResponse } from '../type';
export declare const generateAccessToken: (payload: Omit<JWTPayload, "iat" | "exp">) => string;
export declare const generateRefreshToken: (userId: string) => string;
export declare const verifyAccessToken: (token: string) => JWTPayload;
export declare const verifyRefreshToken: (token: string) => {
    userId: string;
    type: string;
};
export declare const generateTokenPair: (payload: Omit<JWTPayload, "iat" | "exp">) => TokenResponse;
export declare const extractTokenFromHeader: (authHeader: string | undefined) => string | null;
//# sourceMappingURL=jwt.d.ts.map