import express, { Application } from 'express'
import router from './router'
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app : Application = express()

app.use(cors({ origin: process.env.CLIENT, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser(process.env.COOKIE_SECRET!))
app.use('/', router)

export default app
