module.paths.push('/usr/lib/node_modules')

const express = require('express')
const app = express()
const indexRouter = require('./routes/index')


app.use('/', indexRouter)

app.listen(3003, () => {
    console.log('')
    console.log('')
    console.log('')
    console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''))
    console.log('App listening on port 3003!')
    console.log('')
    console.log('')
    console.log('')
})
