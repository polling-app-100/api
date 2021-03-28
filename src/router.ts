import { Router } from 'express'
import authRoutes from './routes/authRoutes'
import pollRoutes from './routes/pollRoutes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/polls', pollRoutes)

export default router
