import { Router } from 'express'
import controller from '../controllers/pollControllers'

const router: any = Router()
const route: string = '/'

// get all polls that have been made
router.get(route, controller.getAllPollsController)

// create a poll
router.post(route, controller.createPollController)

// deleting polls
router.delete(route, controller.deletePollController)

// editing poll options
router.put(route, controller.editPollController)

// find one specific poll
router.get('/:_id', controller.findPollController)

// [Dev] delete all polls
router.delete('/all', controller.devDeleteAllPolls)

export default router
