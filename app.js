import express from 'express'
import fs from 'fs'
const app = express()

//获取用户的头像
app.get('/v1/getAvatar',(req,res)=>{
    const dirname='./assets/images/avatars/'
    let id=req.query.id
    fs.readFile(dirname+`${id}.png`,(err,data)=>{
        if(!err){
            res.send(data)
        }
        else{
            console.log(err)
        }
    })
})

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000')
})