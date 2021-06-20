import server from './server'
import clustering from './cluster/cluster'
import { createServer } from 'http'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import { conn } from './ws'

function setupMongoose () : void {
  mongoose.set('useFindAndModify', false)
  mongoose.connect(process.env.MONGO_URI! + '/polls-app', { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log('🌿mongodb \x1b[32mconnected\n')
  })
}

if (process.env.NODE_ENV === 'development') {
  setupMongoose()
  const wsServer = createServer(server)

  const io: any = new Server(wsServer, {
    cors: { origin: process.env.CLIENT! }
  })

  io.on('connection', conn)

  wsServer.listen(process.env.PORT || 5005)
  console.log('🚀 server starting at http://localhost:' + (process.env.PORT || 5005))
} else {
  setupMongoose()
  const wsServer = createServer(server)

  const io: any = new Server(wsServer, {
    cors: { origin: process.env.CLIENT! }
  })

  io.on('connection', conn)

  clustering(() => { wsServer.listen(process.env.PORT || 5005) })
  console.log('🚀 server starting at http://localhost:' + (process.env.PORT || 5005))
}
