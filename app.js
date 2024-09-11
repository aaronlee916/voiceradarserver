import express from "express";
import fs from "fs";
import UserData from "./assets/data/userdata.js";
import { trendingCV, trendingStaff } from "./assets/data/trending.js";
import cors from 'cors'

const app = express();
app.use(express.json()); // 用于解析 JSON 类型的请求体
app.use(express.urlencoded({ extended: true })); // 用于解析 URL-encoded 类型的请求体
app.use(cors())


const avatarRoot = "./assets/images/avatars/";
const dataRoot = "./assets/data/";

//获取用户的头像
app.get("/v1/getAvatar", (req, res) => {
  let id = req.query.id;
  fs.readFile(avatarRoot + `${id}.png`, (err, data) => {
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
  let hasDuplicate = false;
  for (let item of UserData) {
    if (item.id == req.body.id) {
      hasDuplicate = true;
      break;
    }
  }
  if (!hasDuplicate) {
    UserData.push(req.body);
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
  } else {
    res.send(UserData);
  }
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
  fs.writeFile(
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
//删除用户信息，会写入文件
app.delete("/v1/deleteUser", (req, res) => {
  for (let item of UserData) {
    if (req.body.id == item.id) {
      UserData.splice(req.body.id, 1);
      break;
    }
  }
  fs.writeFile(
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
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on https://voiceradarserver.onrender.com`);
});
