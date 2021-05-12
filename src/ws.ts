import { Socket } from 'socket.io'
import type { Message, PollI, UserI, VotedIn } from './interfaces'
import Polls from './models/PollModel'
import User from './models/UserModel'

export function conn (socket : Socket): void {
  // if someone votes this fires
  socket.on('vote', async (message: Message) => {
    await User.findOne({ _id: message.voterId })
      .then(async (d: any) => {
        // user part of voting
        const user: UserI = d

        let voted : boolean = false
        // check if user has voted before
        user.votedIn.forEach((vote : VotedIn) => {
          if (vote.pollId === message.pollId) {
            // if true, sends back message with specific _id to not trigger other clients
            voted = true
            return socket.emit('rejected', { pollId: message.pollId, optionId: message.option, voterId: message.voterId, error: 'you have voted already' })
          } else {
            voted = false
          }
        })

        if (!voted) {
          user.votedIn.push({ pollId: message.pollId, optionId: message.option })
          user.save()
          // poll part of voting
          const data : any = await Polls.findOne({ _id: message.pollId })
          const poll: PollI = data
          const geoArea : string = message.geoArea
          const ageGroup : string = message.ageGroup

          poll.voteCount++
          poll.options.forEach(option => {
            if (option._id.toString() === message.option) {
              return option.currentVotes++
            }
          })
          poll.geoAreaCount[geoArea]++
          poll.ageGroup[ageGroup]++
          poll.save()

          socket.broadcast.emit('vote', { pollId: message.pollId, optionId: message.option })
        }
      })
  })

  // if someone unvotes this fires
  socket.on('unvote', async (message: Message) => {
    await User.findOne({ _id: message.voterId })
      .then(async (d: any) => {
        // poll part of unvoting
        const data : any = await Polls.findOne({ _id: message.pollId })
        const poll : PollI = data
        const geoArea : string = message.geoArea
        const ageGroup : string = message.ageGroup

        poll.voteCount--
        poll.options.forEach(option => {
          if (option._id.toString() === message.option) {
            return option.currentVotes--
          }
        })
        poll.geoAreaCount[geoArea]--
        poll.ageGroup[ageGroup]--
        poll.save()

        // user part of unvoting
        const user: UserI = d
        for (let i = 0; i < user.votedIn.length; i++) {
          if (user.votedIn[i].optionId === message.option) {
            user.votedIn.splice(i, 1)
          }
        }
        user.save()
        socket.broadcast.emit('unvote', { pollId: message.pollId, optionId: message.option })
      })
  })
}
