import express from "express";
import fs from "fs";
import { trendingCV, trendingStaff } from "./assets/data/trending.js";
import cors from "cors";
import { promisify } from "util";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { encryptPassword, verifyPassword } from "./utils/md5.js";
import { generateToken, validateToken } from "./utils/jwt.js";

const app = express();

const avatarRoot = "./assets/images/";
const dataRoot = "./assets/data/";
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const rename = promisify(fs.rename);
const uploads = multer({ dest: "./public" });
const prisma = new PrismaClient();
const router = express.Router();

app.use(express.json()); // 用于解析 JSON 类型的请求体
app.use(express.urlencoded({ extended: true })); // 用于解析 URL-encoded 类型的请求体
app.use(cors());
app.use("/v1", router);

/**
 * @api {get} /getUserAvatar Request User Avatar
 * @apiName GetUserAvatar
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {Buffer} avatar buffer.
 */

router.get("/getUserAvatar", validateToken, (req, res) => {
  let id = req.query.id;
  readFile(avatarRoot + `useravatars/${id}.png`, (err, data) => {
    if (!err) {
      res.set("Content-Type", "image/jpeg");
      res.send(data);
    } else {
      console.log(err);
    }
  });
});

/**
 * @api {get} /getArtistAvatar Request Artist Avatar
 * @apiName GetArtistAvatar
 * @apiGroup Artist
 *
 * @apiParam {Number} id Artists unique ID.
 *
 * @apiSuccess {Buffer} Avatar Buffer.
 */

router.get("/getArtistAvatar", validateToken, (req, res) => {
  let id = req.query.id;
  readFile(avatarRoot + `artistavatars/${id}.png`, (err, data) => {
    if (!err) {
      res.set("Content-Type", "image/jpeg");
      res.send(data);
    } else {
      console.log(err);
    }
  });
});
/**
 * @api {get} /login
 * @apiName Login
 * @apiGroup Login
 *
 * @apiParam {String} name Username
 *@apiParam {String} password Users password.
 * @apiSuccess {String} token Users token
 */
router.get("/login", async (req, res) => {
  let username = req.body.name;
  let password = req.body.password;
  let user = await prisma.user.findUnique({
    where: {
      name: username,
    },
  });
  if (verifyPassword(password, user.password)) {
    res.send(await generateToken(user));
  } else {
    res.send("密码错误！");
  }
});
/**
 * @api {post} /register User Register
 * @apiName Register
 * @apiGroup User
 *
 * @apiParam {User} user User
 *
 * @apiSuccess {String} 200.
 */
router.post("/register", async (req, res) => {
  let newUser = await prisma.user.create({
    data: {
      nickname: req.body.nickname,
      name: req.body.name,
      sex: req.body.sex,
      password: encryptPassword(req.body.password),
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      UserDescription: req.body.UserDescription,
    },
  });
  res.send("200");
});
/**
 * @api {get} /getTrendingCV Request trending CVs
 * @apiName getTrendingCV
 * @apiGroup Artist
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get("/getTrendingCV", validateToken, (req, res) => {
  res.send(trendingCV);
});
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get("/getTrendingStaff", validateToken, (req, res) => {
  res.send(trendingStaff);
});
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get("/getAllUsers", validateToken, async (req, res) => {
  let allUsers = await prisma.user.findMany();
  res.send(allUsers);
});
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get("/getAllArtists", validateToken, async (req, res) => {
  let allArtists = await prisma.artist.findMany();
  res.send(allArtists);
});
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get("/getUser", validateToken, async (req, res) => {
  let id = Number.parseInt(req.query.id);
  let user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  res.send(user);
});
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post("/addArtist", validateToken, async (req, res) => {
  await prisma.artist.create({
    name: req.body.name,
    weiboLink: req.body.weiboLink,
    qq: req.body.qq,
    isCV: req.body.isCV,
    isStaff: req.body.isStaff,
    voiceType: req.body.voiceType,
    soundPressure: req.body.soundPressure,
    demoLink: req.body.demoLink,
    artistDescription: req.body.artistDescription,
  });
});
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post("/updateUser", validateToken, async (req, res) => {
  let updatedUser = req.body;
  let id = req.query.id;
  await prisma.user.update({
    where: {
      id,
    },
    data: {
      name: updatedUser.name,
      sex: updatedUser.sex,
      password: encryptPassword(updatedUser.password),
      phoneNumber: updatedUser.phoneNumber,
      UserDescription: updatedUser.UserDescription,
      email: updatedUser.email,
    },
  });
  console.log(await prisma.user.findMany());
});
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post("/updateArtist", validateToken, async (req, res) => {
  await prisma.artist.update({
    name: req.body.name,
    weiboLink: req.body.weiboLink,
    qq: req.body.qq,
    isCV: req.body.isCV,
    isStaff: req.body.isStaff,
    voiceType: req.body.voiceType,
    soundPressure: req.body.soundPressure,
    demoLink: req.body.demoLink,
    artistDescription: req.body.artistDescription,
  });
});
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get("/searchCV", validateToken, async (req, res) => {
  let cv = await prisma.artist.findMany({
    where: {
      name: req.query.name,
      isCV: true,
    },
  });
  res.send(generateToken(cv));
});
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get("/searchStaff", validateToken, async (req, res) => {
  let staffs = await prisma.artist.findMany({
    where: {
      name: req.query.name,
      isStaff: true,
    },
  });
  res.send(generateToken(staffs));
});
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.delete("/deleteUser", validateToken, async (req, res) => {
  await prisma.user.delete({
    where: {
      id: req.query.id,
    },
  });
});
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.delete("/deleteArtist", validateToken, async (req, res) => {
  await prisma.artist.delete({
    where: {
      id: req.query.id,
    },
  });
});
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post(
  "/uploadUserAvatar",
  validateToken,
  uploads.single("avatar"),
  (req, res, next) => {
    let id = req.query.id;
    let originalName = req.file.originalname;
    let fileType = originalName.split(".")[1];
    rename(
      `./public/${req.file.filename}`,
      `./assets/images/useravatars/${id}.${fileType}`
    );
    res.send("Success!");
  }
);
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post(
  "/uploadArtistAvatar",
  validateToken,
  uploads.single("avatar"),
  (req, res, next) => {
    let id = req.query.id;
    let originalName = req.file.originalname;
    let fileType = originalName.split(".")[1];
    rename(
      `./public/${req.file.filename}`,
      `./assets/images/artistavatars/${id}.${fileType}`
    );
    res.send("Success!");
  }
);
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post(
  "/uploadDemo",
  validateToken,
  uploads.single("demo"),
  (req, res, next) => {
    let id = req.query.id;
    let originalName = req.file.originalname;
    let fileType = originalName.split(".")[1];
    rename(`./public/${req.file.filename}`, `./assets/audio/${id}.${fileType}`);
  }
);
/**
 * @api {get} /user/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get("/getDemo", validateToken, (req, res) => {
  let id = req.query.id;
  readFile(`assets/audio/${id}.mp3`, (err, data) => {
    res.send(data);
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on localhost:${process.env.PORT || 3000}`);
});
