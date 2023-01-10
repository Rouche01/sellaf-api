import { CookieOptions, Response } from 'express';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from 'src/constants';

export const setCookieOptions = (
  appEnvironment: string,
  maxAge?: number,
): CookieOptions => {
  const isProduction = appEnvironment === 'production';
  return {
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAge || 1000 * 60 * 60 * 24 * 100,
    ...(isProduction && { domain: '.sellaf.africa' }),
    // domain: 'localhost:3000',
  };
};

export const setAccessTokenCookie = (
  resObj: Response,
  value: string,
  env: string,
) => {
  resObj.cookie(ACCESS_TOKEN_KEY, value, setCookieOptions(env));
};

export const setRefreshTokenCookie = (
  resObj: Response,
  value: string,
  env: string,
) => {
  resObj.cookie(REFRESH_TOKEN_KEY, value, setCookieOptions(env));
};
