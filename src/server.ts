import express, { Application } from 'express'
import mongoose from 'mongoose'
import router from './router'
import cookieParser from 'cookie-parser'
import cors from 'cors'

async function startServer () : Promise<void> {
  const app: Application = express()
  mongoose.set('useFindAndModify', false)
  await mongoose.connect(process.env.MONGO_URI! + '/polls-app', { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('🌿mongodb \x1b[32mconnected\n')
    })

  app.use(cors({ origin: process.env.CLIENT, credentials: true }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser(process.env.COOKIE_SECRET!))
  app.use('/', router)

  app.listen(process.env.PORT! || 5005, () => {
    console.log(`🚀 server starting at \x1b[34mhttp://localhost:${process.env.PORT! || 5005}\n`)
  })
}

export default startServer
