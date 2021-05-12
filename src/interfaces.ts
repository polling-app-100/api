import { Document } from 'mongoose'

// polls
interface Options {
    _id: number,
    title: string,
    currentVotes: number
}

interface GeoAreaCount{
    [index: string]: number
    asia: number
    oceania: number
    europe: number
    northAmerica: number
    southAmerica: number
}

interface AgeGroup {
    [index: string]: number
    children: number
    youth: number
    adults: number
    seniors: number
}

export interface PollI extends Document {
    author: string
    title: string
    createdAt: string
    voteCount: number,
    _id: string,
    options: Array<Options>,
    ageGroup: AgeGroup
    geoAreaCount: GeoAreaCount
    error?: string
}

// users
export interface VotedIn {
    _id?: String
    pollId: string
    optionId: string
}

export interface UserI extends Document {
    username: string
    password?: string
    _id: string
    ageGroup: string
    region: string
    votedIn: Array<VotedIn>
    createdPolls: Array<string>
    error?: string
}

export interface Message {
    pollId: string
    voterId: string
    option: string
    ageGroup: string
    geoArea: string
}
