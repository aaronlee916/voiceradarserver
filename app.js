import express from "express";
import fs from "fs";
import { UserData } from "./assets/data/userdata.js";
import { trendingCV, trendingStaff } from "./assets/data/trending.js";


const app = express();

//获取用户的头像
app.get("/v1/getAvatar", (req, res) => {
  const dirname = "./assets/images/avatars/";
  let id = req.query.id;
  fs.readFile(dirname + `${id}.png`, (err, data) => {
    if (!err) {
      res.send(data);
    } else {
      console.log(err);
    }
  });
});
//获取人气最高CV
app.get('/v1/getTrendingCV',(req,res)=>{
  res.send(trendingCV)
})
//获取人气最高Staff
app.get('/v1/getTrendingStaff',(req,res)=>{
  res.send(trendingStaff)
})
//获取所有用户
app.get('/v1/getAllUsers',(req,res)=>{
    res.send(UserData)
})
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
//添加用户
app.post("/v1/addUser", (req, res) => {

});
app.listen( process.env.PORT||3000, () => {
  console.log(`Server running on https://voiceradarserver.onrender.com`);
});
