import startServer from './server'
import clustering from './cluster/cluster'

if (process.env.NODE_ENV === 'development') {
  startServer()
} else {
  clustering(async () => await startServer())
}
