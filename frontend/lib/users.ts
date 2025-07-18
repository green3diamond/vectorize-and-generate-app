// server side
import fs from 'fs'
import path from 'path'


export default function validateUser(username:string, password:string){
    const usersPath = path.join(process.cwd(), 'data', 'users.json')
    const usersData = fs.readFileSync(usersPath, 'utf8')
    const users = JSON.parse(usersData)
    const user = users.find(u => u.username == username && u.password == password)
    // console.log(user)
    return user
}