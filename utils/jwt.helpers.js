import jwt from "jsonwebtoken";

function jwtTokens({ id, name, email }) {
  const user = { id, name, email };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30m",
  });
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "3h",
  });
  return { accessToken, refreshToken };
}

export { jwtTokens };
