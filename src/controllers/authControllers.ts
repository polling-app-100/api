import { Response, Request } from 'express'
import type { UserI } from '../interfaces'
import User from '../models/UserModel'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

async function signUpController (req: Request, res: Response) {
  const { username, password, ageGroup, region } = req.body // getting required data from body

  if (!username || !password || !ageGroup || !region) {
    return res.status(400).json({
      error:
        'incomplete body, required items are username, password, ageGroup and region'
    })
  }

  const ageG = ageGroup.toLowerCase()
  if (
    ageG === 'children' ||
    ageG === 'youth' ||
    ageG === 'adults' ||
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
          return res
            .status(200)
            .json({ message: 'you have already been registered' })
        } else {
          // if user doesnt exist then we make a new user object
          await new User({ username, password, ageGroup, region, votedIn: [], pollsCreated: [] })
            .save()
            .then((data: any) => {
              const wToken = jwt.sign(
                { userId: data._id },
                process.env.JWT_SECRET!,
                { expiresIn: '3d' }
              )
              res.cookie('pollAppAuth', wToken, {
                maxAge: 3 * 86400000,
                httpOnly: true
              })
              return res
                .status(200)
                .json({ message: 'user sucessfully registered' })
            })
        }
      } catch (e) {
        // error handling
        return res.status(400).json({ error: e.message })
      }
    } else {
      return res.status(400).json({ error: 'invalid region' })
    }
  } else {
    return res.status(400).json({ error: 'invalid age group' })
  }
}

async function loginController (req: Request, res: Response) {
  if (req.cookies.pollAppAuth) {
    jwt.verify(
      req.cookies.pollAppAuth!,
      process.env.JWT_SECRET!,
      (err: any, decoded: any) => {
        if (err) {
          return res.status(400).json({ error: err })
        }

        const wToken = jwt.sign(
          { userId: decoded.userId },
          process.env.JWT_SECRET!,
          { expiresIn: '72h' }
        )
        res.cookie('pollAppAuth', wToken, {
          maxAge: 3 * 86400000,
          httpOnly: true,
          domain: 'localhost'
        })
        return res
          .status(200)
          .json({ message: 'you have been succesfully logged in' })
      }
    )
  }

  if (!req.cookies.pollAppAuth) {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        error: 'incomplete body, required fields are username and password'
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
              res.cookie('pollAppAuth', wToken, {
                maxAge: 3 * 86400000,
                httpOnly: true,
                domain: 'localhost'
              })
              return res
                .status(200)
                .json({ message: 'you have been succesfully logged in' })
            } else {
              return res.status(400).json({ error: 'incorrect password' })
            }
          })
        } else {
          return res.status(400).json({ error: 'you are not registered' })
        }
      })
    } catch (e) {
      return res.status(400).json({ error: e.message })
    }
  }
}

async function logoutController (_: Request, res: Response) {
  try {
    res.cookie('pollAppAuth', null, { maxAge: 1 })
    return res.status(200).json({ message: 'succesfuly logged out' })
  } catch (e) {
    return res.status(400).json({ error: e })
  }
}

async function getUserController (req: Request, res: Response) {
  if (!req.cookies.pollAppAuth) {
    return res.status(400).json({ error: 'you are not logged in' })
  }

  let user: string = ''

  jwt.verify(
    req.cookies.pollAppAuth!,
    process.env.JWT_SECRET!,
    (err: any, decoded: any) => {
      if (err) {
        return res.status(400).json({ error: err })
      }
      user = decoded.userId
    }
  )

  try {
    await User.findById(user).then((data: any) => {
      const user: UserI = data
      const body: any = {
        _id: user._id,
        username: user.username,
        createdPolls: user.pollsCreated,
        region: user.region,
        votedIn: user.votedIn,
        ageGroup: user.ageGroup
      }
      return res.status(200).json(body)
    })
  } catch (e) {
    return res.status(400).json({ error: e })
  }
}

async function updateUserController (req: Request, res: Response) {
  const { username, region, ageGroup } = req.body

  if (!username || !region || !ageGroup) {
    return res.status(400).json({
      error: 'invalid body, expected "username", "region" and "ageGroup"'
    })
  }

  if (!req.cookies.pollAppAuth) {
    return res.status(400).json({ error: 'you are not logged in' })
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
    await User.findById(user).then(async (d) => {
      if (!d) {
        return res.status(400).json({ error: "user doesn't exist" })
      } else if (d._id.toString() !== user) {
        return res
          .status(400)
          .json({ error: 'you are not authorized to edit this user' })
      } else {
        // updating the user
        await User.findByIdAndUpdate(user, { username, region, ageGroup }).then(
          () => {
            return res.status(200).json({ message: 'updated user' })
          }
        )
      }
    })
  } catch (e) {
    return res.status(400).json({ error: e })
  }
}

async function deleteUser (req: Request, res: Response) {
  if (!req.cookies.pollAppAuth) {
    return res.status(400).json({ error: 'you are not logged in' })
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
    await User.findOne({ _id: user }).then(async (data) => {
      if (data) {
        await User.deleteOne({ _id: user }).then((_) => {
          return res.status(200).json({ message: 'user sucessfullly deleted' })
        })
      } else {
        return res.status(400).json({ error: 'user not found' })
      }
    })
  } catch (e) {
    return res.status(400).json({ error: e })
  }
}

async function devAllUsers (_: Request, res: Response) {
  try {
    await User.find({}).then((data) => {
      return res.status(200).json(data)
    })
  } catch (e) {
    return res.status(400).json({ error: e })
  }
}

async function getAuthor (req: Request, res: Response) {
  const { _id } = req.body

  try {
    await User.findById(_id).then((data: any) => {
      const user = data
      res.status(200).json({ author: user.username })
    })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

async function clear (_: Request, res: Response) {
  try {
    await User.deleteMany({})
      .then(() => { res.status(200).json({ message: 'success' }) })
  } catch (e) {
    res.status(400).json(e)
  }
}

export default {
  signUpController,
  loginController,
  logoutController,
  getUserController,
  updateUserController,
  deleteUser,
  devAllUsers,
  getAuthor,
  clear
}
