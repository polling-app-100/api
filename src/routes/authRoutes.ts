import { Router, Request, Response } from 'express'
import User from '../models/UserModel'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const router: any = Router()

router.post('/signup', async (req: Request, res: Response) => {
  const { username, password, ageGroup, region } = req.body // getting required data from body

  if (!username || !password || !ageGroup || !region) {
    return res
      .status(400)
      .json({
        message:
          'incomplete body, required items are username, password, ageGroup and region'
      })
  }

  const ageG = ageGroup.toLowerCase()
  if (
    ageG === 'children' ||
    ageG === 'youth' ||
    ageG === 'adult' ||
    ageG === 'seniors'
  ) {
    // validating age group
    const reg = region.toLowerCase()
    if (
      reg === 'north america' ||
      reg === 'south america' ||
      reg === 'europe' ||
      reg === 'africa' ||
      reg === 'asia' ||
      reg === 'oceania'
    ) {
      // validating region
      try {
        const userExists = await User.findOne({ username }) // check if user exists or not
        if (userExists) {
          // if so, we tell them that they have already been registered
          res.status(200).json({ message: 'you have already been registered' })
        } else {
          // if user doesnt exist then we make a new user object
          await new User({ username, password, ageGroup, region })
            .save()
            .then((data) => {
              const wToken = jwt.sign(
                { userId: data._id },
                process.env.JWT_SECRET!,
                { expiresIn: '3d' }
              )
              res.cookie('pollAppAuth', wToken, { maxAge: 3 * 86400000 })
              return res
                .status(200)
                .json({ message: 'user sucessfully registered' })
            })
        }
      } catch (e) {
        // error handling
        return res.status(400).json({ message: e.message })
      }
    } else {
      return res.status(400).json({ message: 'invalid region' })
    }
  } else {
    return res.status(400).json({ message: 'invalid age group' })
  }
})

// [Dev] endpoint to get all users registered
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res
      .status(400)
      .json({
        message: 'incomplete body, required fields are username and password'
      })
  }

  try {
    await User.findOne({ username }).then((user: any) => {
      if (user) {
        bcrypt.compare(password, user.password, (err: any, same: Boolean) => {
          if (err) return res.json({ message: err })
          if (same) {
            const wToken = jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET!,
              { expiresIn: '72h' }
            )
            res.cookie('pollAppAuth', wToken, { maxAge: 3 * 86400000 })
            return res
              .status(200)
              .json({ message: 'you have been succesfully logged in' })
          } else {
            res.status(400).json({ message: 'incorrect password' })
          }
        })
      } else {
        return res.status(400).json({ message: 'you are not registered' })
      }
    })
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

router.post('/logout', (req: Request, res: Response) => {
  try {
    res.cookie('pollAppAuth', null, { maxAge: 1 })
    return res.status(400).json({ message: 'succesfuly logged out' })
  } catch (e) {
    res.status(400).json({ message: e })
  }
})

router.get('/allUsers', async (req: Request, res: Response) => {
  try {
    await User.find({})
      .then((data) => {
        return res.status(200).json(data)
      })
  } catch (e) {
    return res.status(400).json(e)
  }
})

router.delete('/deleteUser', async (req: Request, res: Response) => {
  const { _id } = req.body
  try {
    await User.deleteOne({ _id })
      .then((data) => {
        return res.status(200).json(data)
      })
  } catch (e) {
    return res.status(400).json(e)
  }
})

export default router
