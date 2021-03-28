import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import Poll from '../models/PollModel'

const router : any = Router()

// get all polls that have been made
router.get('/getAllPolls', async (req: Request, res: Response) => {
  try {
    await Poll.find({})
      .then((d) => {
        return res.status(200).json(d)
      })
  } catch (e) {
    return res.status(400).json({ error: e })
  }
})

// create a poll
router.post('/createPoll', async (req: Request, res: Response) => {
  const { options } = req.body // options for other users to vote on

  // check if user is logged in
  if (!req.cookies.pollAppAuth) {
    return res.status(400).json({ error: 'Please log in to create new poll' })
  }

  let user = ''

  // get used Id to create poll
  jwt.verify(req.cookies.pollAppAuth, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) { return res.status(400).json({ error: err }) }
    user = decoded.userId
  })

  // creating poll
  try {
    const newPoll = new Poll({
      options,
      voteCount: 0,
      geoAreaCount: {
        asia: 0,
        oceania: 0,
        europe: 0,
        northAmerica: 0,
        southAmerica: 0
      },
      AgeGroup: {
        children: 0,
        youth: 0,
        adults: 0,
        seniors: 0
      },
      author: user
    })
    await newPoll.save()
      .then((d) => res.status(200).json({ message: 'Poll Created', d }))
  } catch (e) {
    return res.status(400).json({ error: e })
  }
})

// deleting polls
router.delete('/deletePoll', async (req: Request, res: Response) => {
  const { _id } = req.body // id of selected poll

  // check if user is logged in
  if (!req.cookies.pollAppAuth) {
    return res.status(400).json({ error: 'Please login to delete polls' })
  }

  let user = ''

  // getting user Id
  jwt.verify(req.cookies.pollAppAuth, process.env.JWT_SECRET!, (err : any, decoded : any) => {
    if (err) { return res.status(200).json({ error: err }) }
    user = decoded.userId
  })

  try {
    // make sure that poll belongs to request user
    const poll: any = await Poll.findById(_id)
    if (poll.author !== user) {
      return res.status(400).json({ message: 'you are not authorized to delete this poll' })
    } else if (poll.author === user) {
      await Poll.deleteOne({ _id })
        .then(() => {
          return res.status(200).json({ message: 'poll deleted' })
        })
    }
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
})

export default router
