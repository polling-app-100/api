import server from './server'
import clustering from './cluster/cluster'

if (process.env.NODE_ENV === 'development') {
  server.startServer()
} else {
  clustering(async () => await server.startServer())
}
