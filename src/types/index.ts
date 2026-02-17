import { ObjectId } from 'mongoose'

export interface IUser {
  _id: ObjectId | string
  email: string
  password: string
  name: string
  image?: string
  movies: ObjectId[] | string[]
  createdAt: Date
  updatedAt: Date
}

export interface IMovie {
  _id: ObjectId | string
  title: string
  year: string
  director: string
  cast: string
  rating: number
  genre: string[]
  region: string
  poster: string
  doubanUrl: string
  watched: boolean
  userRating: number
  userReview: string
  addedBy: ObjectId | string
  createdAt: Date
  updatedAt: Date
}

export interface IParticipant {
  userId: string
  name: string
  isHost: boolean
  joinedAt: Date
  selectedMovies: string[]
}

export interface IRoomMovieMeta {
  id: string
  title: string
  poster: string
  year: string
  rating: number
}

export type MoviesById = Record<string, IRoomMovieMeta>

export interface IDrawResult {
  movieId: string
  movieTitle: string
  drawnAt: Date
  seed: number
}

export interface IRoom {
  _id: ObjectId | string
  code: string
  hostId: string
  participants: IParticipant[]
  status: 'waiting' | 'drawing' | 'completed'
  drawResult?: IDrawResult
  createdAt: Date
  updatedAt: Date
}

export interface IDrawHistory {
  _id: ObjectId | string
  userId: string
  roomCode: string
  movieId: string
  movieTitle: string
  moviePoster: string
  movieYear: string
  movieRating: number
  participants: number
  drawnAt: Date
  createdAt: Date
}

export interface DoubanMovieData {
  title: string
  year: string
  director: string
  cast: string
  rating: number
  genre: string[]
  region: string
  poster: string
  doubanUrl: string
}

export type RoomStatus = 'waiting' | 'drawing' | 'completed'
