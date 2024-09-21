import express from "express";
import fs from "fs";
import { trendingCV, trendingStaff } from "./assets/data/trending.js";
import cors from "cors";
import { promisify } from "util";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { encryptPassword } from "./utils/md5.js";
import { generateToken, validateToken } from "./utils/jwt.js";

const app = express();

const avatarRoot = "./assets/images/avatars/";
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
app.use("/", router);

router
  .get("/v1/getAvatar", validateToken, (req, res) => {
    let id = req.query.id;
    readFile(avatarRoot + `${id}.png`, (err, data) => {
      if (!err) {
        res.set("Content-Type", "image/jpeg");
        res.send(data);
      } else {
        console.log(err);
      }
    });
  })
  .get("/v1/getTrendingCV", validateToken, (req, res) => {
    res.send(trendingCV);
  })
  .get("/v1/getTrendingStaff", validateToken, (req, res) => {
    res.send(trendingStaff);
  })
  .get("/v1/getAllUsers", validateToken, async (req, res) => {
    let allUsers = await prisma.user.findMany();
    res.send(allUsers);
  })
  .get("/v1/getUser", validateToken, async (req, res) => {
    let id = Number.parseInt(req.query.id);
    let user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    res.send(user);
  })
  .post("/v1/addUser", async (req, res) => {
    let newUser = await prisma.user.create({
      data: {
        name: req.body.name,
        sex: req.body.sex,
        password: encryptPassword(req.body.password),
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        UserDescription: req.body.UserDescription,
        avatarLink: req.body.avatarLink,
      },
    });
    newUser.token = await generateToken(newUser);
    res.send(newUser);
  })
  .post("/v1/addArtist", validateToken, async (req, res) => {
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
  })
  .post("/v1/updateUser", validateToken, async (req, res) => {
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
  })
  .post("/v1/updateArtist", validateToken, async (req, res) => {
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
  })
  .get("/v1/searchCV", validateToken, async (req, res) => {
    let cv = await prisma.artist.findMany({
      where: {
        name: req.query.name,
        isCV: true,
      },
    });
    res.send(generateToken(cv));
  })
  .get("/v1/searchStaff", validateToken, async (req, res) => {
    let staffs = await prisma.artist.findMany({
      where: {
        name: req.query.name,
        isStaff: true,
      },
    });
    res.send(generateToken(staffs));
  })
  .delete("/v1/deleteUser", validateToken, async (req, res) => {
    await prisma.user.delete({
      where: {
        id: req.query.id,
      },
    });
  })
  .delete("/v1/deleteArtist", validateToken, async (req, res) => {
    await prisma.artist.delete({
      where: {
        id: req.query.id,
      },
    });
  })
  .post(
    "/v1/uploadAvatar",
    validateToken,
    uploads.single("avatar"),
    (req, res, next) => {
      let id = req.query.id;
      let originalName = req.file.originalname;
      let fileType = originalName.split(".")[1];
      rename(
        `./public/${req.file.filename}`,
        `./assets/images/avatars/${id}.${fileType}`
      );
    }
  )
  .post(
    "/v1/uploadDemo",
    validateToken,
    uploads.single("demo"),
    (req, res, next) => {
      let id = req.query.id;
      let originalName = req.file.originalname;
      let fileType = originalName.split(".")[1];
      rename(
        `./public/${req.file.filename}`,
        `./assets/audio/${id}.${fileType}`
      );
    }
  )
  .get("/v1/getDemo", validateToken, (req, res) => {
    let id = req.query.id;
    readFile(`assets/audio/${id}.mp3`, (err, data) => {
      res.send(data);
    });
  });

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on localhost:${process.env.PORT || 3000}`);
});
