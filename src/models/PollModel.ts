import { Schema, model } from 'mongoose'

// Db object for polls, used for analising and presenting data in frontend
const PollSchema = new Schema({
  // actual things for people to vote on
  options: [
    {
      title: { type: 'String' },
      currentVotes: { type: 'Number' }
    }
  ],
  // total amount of votes
  voteCount: 'String',
  // user specific data for data analisis
  geoAreaCount: {
    asia: { type: 'Number' },
    oceania: { type: 'Number' },
    europe: { type: 'Number' },
    northAmerica: { type: 'Number' },
    southAmerica: { type: 'Number' }
  },
  AgeGroup: {
    children: { type: 'Number' },
    youth: { type: 'Number' },
    adults: { type: 'Number' },
    seniors: { type: 'Number' }
  },
  // author for auth and security purposes
  author: { type: 'String' }
})

const PostModel = model('Poll', PollSchema)

export default PostModel
