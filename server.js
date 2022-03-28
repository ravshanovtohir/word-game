// Email => ravshanovtohir11@gmail.com
// writed by Node JS

const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')
const PORT = process.env.PORT || 5000
const multer = require("multer")
const { json } = require('express')

//
let users = require('./database/users.json')
let started = require('./database/started.json')
let words = require('./database/words.json')

//Global uchun
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//Routerlar
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'login.html')))
app.get('/wait', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'kutish.html')))
app.get('/game', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'game.html')))
app.get('/404', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'notfound.html')))
app.get('/users', (req, res) => res.send(users))
app.get('/isStarted', (req, res) => res.send(started))
app.get('/words', (req, res) => res.send(words))
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'notfound.html')))


//DELETE
app.delete('/user', (req, res) => {
    let check = false

    for (let i = 0; i < users.length; i++) {
        if (users[i].userId == req.body.userId) {
            users[i].turn = false
            for (let a = i + 1; a <= users.length - 1; a++) {
                if (!users[a].turn && users[a].gaming) {
                    users[a].turn = true
                    check = true
                    break
                }
            }
            if (!check) {
                for (let b = 0; b < i; b++) {
                    if (!users[b].turn && users[b].gaming) {
                        users[b].turn = true
                        break
                    }
                }
            }
            break
        }
    }

    users = users.filter(user => user.userId != req.body.userId)
    fs.writeFileSync('./database/users.json', JSON.stringify(users))
    res.status(200).send('Ok')
})

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

app.post('/enter', upload.single('image'),
    (req, res) => {
        const { username } = req.body, image = req.file.originalname

        if (started.started === false) {
            users.push({ "username": username, "userId": users.length ? users.at(-1).userId + 1 : 1, "profileImg": image, "gaming": true, "turn": users.length ? false : true })
            fs.writeFileSync('./database/users.json', JSON.stringify(users))
            res.status(200).json({ userId: users.at(-1).userId, site: '/game' })

        } else if (started.started === true) {
            users.push({ "username": username, "userId": users.length ? users.at(-1).userId + 1 : 1, "profileImg": image, "gaming": false, "turn": false })
            fs.writeFileSync('./database/users.json', JSON.stringify(users, null, 4))
            res.status(200).json({ userId: users.at(-1).userId, site: '/wait' })
        }
    }
)


//POST
app.post('/ended', (req, res) => {
    started = { "started": false }
    words = { "word": [] }
    users = users.filter(user => !user.gaming)

    let userCopy = []

    if (users.length) {
        for (let user of users) {
            userCopy.push({ "username": user.username, "userId": user.userId, "profileImg": user.profileImg, "gaming": true, "turn": false })
        }
        userCopy[0].turn = true
    }

    fs.writeFileSync('./database/users.json', users.length ? JSON.stringify(userCopy) : JSON.stringify(users))
    fs.writeFileSync('./database/words.json', JSON.stringify(words))
    fs.writeFileSync('./database/started.json', JSON.stringify(started))

    res.end()
})

app.post('/isStarted', (req, res) => {
    started.started = req.body.isStarted
    fs.writeFileSync('./database/started.json', JSON.stringify(started))
    res.end()
})

app.post('/next', (req, res) => {
    let check = false
    const { word, userId } = req.body

    words.word.push(word)

    for (let i = 0; i < users.length; i++) {
        if (users[i].userId == userId) {
            users[i].turn = false
            for (let a = i + 1; a <= users.length - 1; a++) {
                if (!users[a].turn && users[a].gaming) {
                    users[a].turn = true
                    check = true
                    break
                }
            }
            if (!check) {
                for (let b = 0; b < i; b++) {
                    if (!users[b].turn && users[b].gaming) {
                        users[b].turn = true
                        break
                    }
                }
            }
            break
        }
    }

    fs.writeFileSync('./database/users.json', JSON.stringify(users))
    fs.writeFileSync('./database/words.json', JSON.stringify(words))

    res.end()
})

app.listen(PORT, console.log('http://localhost:' + PORT))