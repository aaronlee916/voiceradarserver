
import { UserData } from './assets/data/userdata'

import express from 'express'
const app = express()

app.get('/v1/', (req, res) => {
    res.send(UserData)
})

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000')
})