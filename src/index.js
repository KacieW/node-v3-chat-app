const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessages}=require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom}=require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT||3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

// let count = 0

io.on('connection', (socket)=>{
    console.log('new Websocket connection')
    //server to client

    // socket.emit('message', generateMessage('Welcome!'))//emit to the specific connection
    //broadcast is to everyone except the new one
    // socket.broadcast.emit('message', generateMessage('a new one is joined'))

    socket.on('join', (options, callback)=>{
        const {error, user}= addUser({id:socket.id, ...options})
        if(error){
           return callback(error)
        }

        socket.join(user.room)//just emit to this room 
        //io.to.emit -> emit to everyone in this room
        //socket.broadcast.to().emit -> emit to everyone else in this room 
        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()

    })
    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))//emit to every connection
        callback()
    })


    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id)
        console.log('send location')
        io.to(user.room).emit('locationMessage', generateLocationMessages(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })

    
})

server.listen(port, ()=>{
    console.log('Server is up on port '+port)
})