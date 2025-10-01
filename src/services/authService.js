/* eslint-disable no-useless-catch */

import { env } from "~/config/environment";

import { JwtProvider } from "~/providers/JwtProvider";

const login = async (user) => {
  const userInfo = {
    _id: user._id,
    email: user.email,
    provider: user.provider,
  };

  const accessToken = await JwtProvider.generateToken(
    userInfo,
    env.ACCESS_TOKEN_SECRET_SIGNATURE,
    env.ACCESS_TOKEN_LIFE
  );

  const refreshToken = await JwtProvider.generateToken(
    userInfo,
    env.REFRESH_TOKEN_SECRET_SIGNATURE,
    env.REFRESH_TOKEN_LIFE
  );

  return { accessToken, refreshToken, user };
};

export const authService = {
  login,
};
