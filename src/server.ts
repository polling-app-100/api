import express, { Application } from 'express'
import mongoose from 'mongoose'

async function startServer () : Promise<void> {
  const app: Application = express()
  await mongoose.connect(process.env.MONGO_URI!, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('🌿mongodb \x1b[32mconnected\n')
    })
  app.listen(process.env.PORT! || 5005, () => {
    console.log(`🚀 server starting at \x1b[34mhttp://localhost:${process.env.PORT! || 5005}\n`)
  })
}

export default startServer
