import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import Poll from '../models/PollModel'
import User from '../models/UserModel'

async function getAllPollsController (req: Request, res: Response) {
  try {
    await Poll.find({}).then((data) => {
      return res.status(200).json(data)
    })
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}

async function createPollController (req: Request, res: Response) {
  const { title, options } = req.body // options for other users to vote on

  if (!title || !options) {
    return res
      .status(400)
      .json({ error: 'incomplete body, expected "title" and "options"' })
  }

  const parsedOptions: any = []
  options.forEach((option: any) => {
    const title = option.title
    parsedOptions.push({
      title,
      currentVotes: 0
    })
  })

  // check if user is logged in
  if (!req.cookies.pollAppAuth) {
    return res.status(400).json({ error: 'Please log in to create new poll' })
  }

  let user: string = ''

  // get used Id to create poll
  jwt.verify(
    req.cookies.pollAppAuth,
    process.env.JWT_SECRET!,
    (err: any, decoded: any) => {
      if (err) {
        return res.status(400).json({ error: err })
      }
      user = decoded.userId
    }
  )

  // creating poll
  try {
    const newPoll = new Poll({
      title,
      options: parsedOptions,
      voteCount: 0,
      geoAreaCount: {
        asia: 0,
        oceania: 0,
        europe: 0,
        northAmerica: 0,
        southAmerica: 0
      },
      ageGroup: {
        children: 0,
        youth: 0,
        adults: 0,
        seniors: 0
      },
      author: user,
      createdAt: Date.now()
    })
    await newPoll.save().then(async (data) => {
      await User.findById(user).then(async (doc: any) => {
        await User.findByIdAndUpdate(user, {
          pollsCreated: [data._id, ...doc.pollsCreated]
        })
      })
      return res.status(200).json({ message: 'Poll Created', data })
    })
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}

async function editPollController (req: Request, res: Response) {
  const { _id, title, options } = req.body // getting poll id and new options

  if (!_id || !title || !options) {
    return res.status(400).json({
      error: 'incomplete body, expected "_id", "title" and "options"'
    })
  }

  // making sure user is logged in
  if (!req.cookies.pollAppAuth) {
    return res.status(400).json({ error: 'please log in to edit polls' })
  }

  let user: string = ''

  // getting user id
  jwt.verify(
    req.cookies.pollAppAuth,
    process.env.JWT_SECRET!,
    (err: any, decoded: any) => {
      if (err) {
        return res.status(400).json({ error: err })
      }
      user = decoded.userId
    }
  )

  try {
    // making sure user is author of poll
    await Poll.findById(_id).then(async (d: any) => {
      if (!d) {
        return res.status(400).json({ error: "poll doesn't exist" })
      } else if (d.author !== user) {
        return res
          .status(400)
          .json({ error: 'you are not authorized to edit this poll' })
      } else {
        // updating the poll
        await Poll.findByIdAndUpdate(_id, { title, options }).then(() => {
          return res.status(200).json({ message: 'updated poll' })
        })
      }
    })
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}

async function deletePollController (req: Request, res: Response) {
  const { _id } = req.body // id of selected poll

  if (!_id) {
    return res.status(400).json({ error: 'incomplete body, expected "_id"' })
  }

  // check if user is logged in
  if (!req.cookies.pollAppAuth) {
    return res.status(400).json({ error: 'Please login to delete polls' })
  }

  let user: string = ''

  // getting user Id
  jwt.verify(
    req.cookies.pollAppAuth,
    process.env.JWT_SECRET!,
    (err: any, decoded: any) => {
      if (err) {
        return res.status(200).json({ error: err })
      }
      user = decoded.userId
    }
  )

  try {
    // make sure that poll belongs to request user
    await Poll.findOne({ _id }).then(async (poll: any) => {
      if (!poll) {
        return res.status(400).json({ error: "poll doesn't exist" })
      } else if (poll.author !== user) {
        return res
          .status(400)
          .json({ error: 'you are not authorized to delete this poll' })
      } else {
        await User.findById(user).then(async (data: any) => {
          const createdPolls = data.pollsCreated
          createdPolls.splice(createdPolls.indexOf())
          await User.updateOne({ _id: user }, { pollsCreated: createdPolls })
        })
        await Poll.deleteOne({ _id }).then(() => {
          return res.status(200).json({ message: 'poll deleted' })
        })
      }
    })
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
}

async function findPollController (req: Request, res: Response) {
  const { _id } = req.params
  try {
    await Poll.findOne({ _id }).then((poll) => {
      return res.status(200).json(poll)
    })
  } catch (e) {
    return res.status(400).json(e)
  }
}

async function devDeleteAllUser (req: Request, res: Response) {
  try {
    await Poll.deleteMany({}).then((d) => res.status(200).json(d))
  } catch (e) {
    return res.status(400).json(e)
  }
}

export default {
  getAllPollsController,
  createPollController,
  editPollController,
  deletePollController,
  findPollController,
  devDeleteAllUser
}
