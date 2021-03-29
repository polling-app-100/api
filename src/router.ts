import { Router } from 'express'
import authRoutes from './routes/authRoutes'
import pollRoutes from './routes/pollRoutes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/api/poll', pollRoutes)

export default router
