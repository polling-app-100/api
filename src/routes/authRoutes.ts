import { Router } from 'express'
import controllers from '../controllers/authControllers'

const router: any = Router()

// sign up route
router.post('/signup', controllers.signUpController)

// login route
router.post('/login', controllers.loginController)

// logout route
router.post('/logout', controllers.logoutController)

// user info route
router.get('/user', controllers.getUserController)

// update user route
router.put('/user', controllers.updateUserController)

// delete user route
router.delete('/deleteUser', controllers.deleteUser)

// get author route
router.get('/author/:_id', controllers.getAuthor)

// [dev] get all users route
router.get('/allUsers', controllers.devAllUsers)

export default router
