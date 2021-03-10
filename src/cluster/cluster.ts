import os from 'os'
import cluster from 'cluster'
const numCPUs = os.cpus().length

function clustering (callBack: any): void {
  if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork()
    }

    cluster.on('death', function (worker) {
      console.log('Worker ' + worker.pid + ' died.')
    })
  } else {
    callBack()
  }
}

export default clustering
