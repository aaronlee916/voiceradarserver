import express from "express";
import fs from "fs";
import { trendingCV, trendingStaff } from "./assets/data/trending.js";
import cors from "cors";
import { promisify } from "util";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { encryptPassword } from "./utils/md5.js";

const app = express();
app.use(express.json()); // 用于解析 JSON 类型的请求体
app.use(express.urlencoded({ extended: true })); // 用于解析 URL-encoded 类型的请求体
app.use(cors());

const avatarRoot = "./assets/images/avatars/";
const dataRoot = "./assets/data/";
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const rename = promisify(fs.rename);
const uploads = multer({ dest: "./public" });
const prisma = new PrismaClient();

//获取用户的头像
app.get("/v1/getAvatar", (req, res) => {
  let id = req.query.id;
  readFile(avatarRoot + `${id}.png`, (err, data) => {
    if (!err) {
      res.set("Content-Type", "image/jpeg");
      res.send(data);
    } else {
      console.log(err);
    }
  });
});

//获取人气最高CV
app.get("/v1/getTrendingCV", (req, res) => {
  res.send(trendingCV);
});
//获取人气最高Staff
app.get("/v1/getTrendingStaff", (req, res) => {
  res.send(trendingStaff);
});
//获取所有用户
app.get("/v1/getAllUsers", async (req, res) => {
  let allUsers = await prisma.user.findMany();
  res.send(allUsers);
});
//获取单个用户信息
app.get("/v1/getUser", async (req, res) => {
  let id = Number.parseInt(req.query.id);
  let user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  res.send(user);
});
//添加用户,会写入文件
app.post("/v1/addUser", async (req, res) => {
  await prisma.user.create({
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
  res.send(
    `用户${req.body.name}创建成功,ID${await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    })}`
  );
});

app.post("/v1/addArtist", async (req, res) => {
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

app.post("/v1/updateUser", async (req, res) => {
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

app.post("/v1/updateArtist", async (req, res) => {
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

//搜索CV API，目前只能GET用户名完全一致的用户
app.get("/v1/searchCV", async (req, res) => {
  res.send(
    await prisma.artist.findMany({
      where: {
        name: req.query.name,
        isCV: true,
      },
    })
  );
});

//搜索Staff API，目前只能GET用户名完全一致的用户
app.get("/v1/searchStaff", async (req, res) => {
  res.send(
    await prisma.artist.findMany({
      where: {
        name: req.query.name,
        isStaff: true,
      },
    })
  );
});

//删除用户信息，会写入文件
app.delete("/v1/deleteUser", async (req, res) => {
  await prisma.user.delete({
    where: {
      id: req.query.id,
    },
  });
});

//删除CV/Staff信息，会写入文件
app.delete("/v1/deleteArtist", async (req, res) => {
  await prisma.artist.delete({
    where: {
      id: req.query.id,
    },
  });
});

//写入用户头像
app.post("/v1/uploadAvatar", uploads.single("avatar"), (req, res, next) => {
  let id = req.query.id;
  let originalName = req.file.originalname;
  let fileType = originalName.split(".")[1];
  rename(
    `./public/${req.file.filename}`,
    `./assets/images/avatars/${id}.${fileType}`
  );
});

//写入用户音频
app.post("/v1/uploadDemo", uploads.single("demo"), (req, res, next) => {
  let id = req.query.id;
  let originalName = req.file.originalname;
  let fileType = originalName.split(".")[1];
  rename(`./public/${req.file.filename}`, `./assets/audio/${id}.${fileType}`);
});

app.get("/v1/getDemo", (req, res) => {
  let id = req.query.id;
  readFile(`assets/audio/${id}.mp3`, (err, data) => {
    res.send(data);
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on localhost:${process.env.PORT || 3000}`);
});
