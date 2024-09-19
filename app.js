import express from "express";
import fs, { read } from "fs";
import UserData from "./assets/data/userdata.js";
import { trendingCV, trendingStaff } from "./assets/data/trending.js";
import cors from "cors";
import { promisify } from "util";
import multer from "multer";
import mongoose from "mongoose";

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


const UserSchema = new mongoose.Schema({
  id: Number,
  name: String,
  phoneNumber:String,
  weiboLink:String,
  qq:String,
  email:String,
  avatarLink: String,
  linkedUserId: Number,
  isCV: Boolean,
  isStaff: Boolean,
  sex: String,
  voiceType: String,
  soundPressure: String,
  demoLink: String,
  description: String,
  genre:[String],
  functionType:[String]
});

mongoose.connect('mongodb://127.0.0.1:27017/myapp');

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
app.get("/v1/getAllUsers", (req, res) => {
  res.send(UserData);
});
//获取单个用户信息
app.get("/v1/getUser", (req, res) => {
  let id = req.query.id;
  for (let item of UserData) {
    if (id == item.id) {
      res.send(item);
      break;
    }
  }
});
//添加用户,会写入文件
app.post("/v1/addUser", (req, res) => {
  let newUser = {};
  //查找可用ID
  for (let i = 0; i < Number.MAX_VALUE; i++) {
    let isOccupied = false;
    for (let item of UserData) {
      if (item.id == i) {
        isOccupied = true;
        break;
      }
    }
    if (!isOccupied) {
      let newUserId = i;
      newUser = req.body;
      newUser.id = newUserId;
    }
  }
  UserData.push(newUser);
  fs.writeFile(
    dataRoot + "userdata.js",
    "export default " + JSON.stringify(UserData),
    (err) => {
      if (!err) {
        res.send(UserData);
      } else {
        res.send(err);
      }
    }
  );
});
app.post("/v1/updateUser", (req, res) => {
  let newUserData = [];
  UserData.map((item) => {
    if (item.id == req.body.id) {
      newUserData.push(req.body);
    } else {
      newUserData.push(item);
    }
  });
  writeFile(
    dataRoot + "userdata.js",
    "export default " + JSON.stringify(newUserData),
    (err) => {
      if (!err) {
        res.send(newUserData);
      } else {
        res.send(err);
      }
    }
  );
});

//搜索CV API，目前只能GET用户名完全一致的用户
app.get("/v1/searchCV", (req, res) => {
  let queryName = req.query.name;
  let isCV = req.query.isCV;
  let result = [];
  for (let item of UserData) {
    if (item.name == queryName && item.isCV == isCV) {
      result.push(item);
    }
  }
  res.send(result);
});

//搜索Staff API，目前只能GET用户名完全一致的用户
app.get("/v1/searchStaff", (req, res) => {
  let queryName = req.query.name;
  let isStaff = req.query.isStaff;
  let result = [];
  for (let item of UserData) {
    if (item.name == queryName && item.isStaff == isStaff) {
      result.push(item);
    }
  }
  res.send(result);
});

//删除用户信息，会写入文件
app.delete("/v1/deleteUser", (req, res) => {
  for (let item of UserData) {
    if (req.body.id == item.id) {
      UserData.splice(req.body.id, 1);
      break;
    }
  }
  writeFile(
    dataRoot + "userdata.js",
    "export default " + JSON.stringify(UserData),
    (err) => {
      if (!err) {
        res.send("Success!");
      } else {
        res.send(err);
      }
    }
  );
});

//写入用户头像
app.post("/v1/uploadAvatar", uploads.single("avatar"), (req, res, next) => {
  let id = req.query.id
  let originalName = req.file.originalname;
  let fileType = originalName.split(".")[1];
  rename(`./public/${req.file.filename}`,`./assets/images/avatars/${id}.${fileType}`)
});

//写入用户音频
app.post("/v1/uploadDemo", uploads.single("demo"), (req, res, next) => {
  let id = req.query.id
  let originalName = req.file.originalname;
  let fileType = originalName.split(".")[1];
  rename(`./public/${req.file.filename}`,`./assets/audio/${id}.${fileType}`)
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
