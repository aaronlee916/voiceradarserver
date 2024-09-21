import jwt from 'jsonwebtoken'

export async function generateToken(user) {
  return await jwt.sign({user}, "4bdcafe4-5d9b-47b3-97c4-a1817aab5167", {
    expiresIn: 60 * 60 * 24,
  });
}
export async function validateToken(req, res, next) {
  let token = req.headers.authorization;
  token = token ? token.split("Bearer ")[1] : null;
  if (!token) {
    res.status(402).json({ error: "请传入token" });
  }
  try {
    await jwt.verify(token, "4bdcafe4-5d9b-47b3-97c4-a1817aab5167");
    next();
  } catch (err) {
    res.status(402).json({ error: "无有效token值" });
  }
}
