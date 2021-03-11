import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new Schema({
  username: { required: true, unique: true, type: String, trim: true },
  password: { required: true, minLength: 6, type: String, trim: true },
  ageGroup: { type: String }, // children 0-14 , youth 15-24, adults 25-29, seniors 65....,
  region: { type: String }, // NorthAmerica, SouthAmerica, Europe, Africa, Asia, Oceania
  votedIn: [String],
  pollsCreated: [String]
})

userSchema.pre('save', function (this: any, next: any) {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return console.log(err)
    bcrypt.hash(this.password, salt, (error, hash) => {
      if (error) return console.log(error)
      this.password = hash
      next()
    })
  })
})

const userModel = model('User', userSchema)

export default userModel
