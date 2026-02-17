import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDrawHistory extends Document {
  userId: string
  userName: string
  roomCode: string
  movieId: string
  movieTitle: string
  moviePoster: string
  movieYear: string
  movieRating: number
  participants: number
  seed: number
  drawnAt: Date
  createdAt: Date
}

const DrawHistorySchema = new Schema<IDrawHistory>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    roomCode: {
      type: String,
      required: true,
      index: true,
    },
    movieId: {
      type: String,
      required: true,
    },
    movieTitle: {
      type: String,
      required: true,
    },
    moviePoster: {
      type: String,
      default: '',
    },
    movieYear: {
      type: String,
      default: '',
    },
    movieRating: {
      type: Number,
      default: 0,
    },
    participants: {
      type: Number,
      default: 1,
    },
    seed: {
      type: Number,
      required: true,
    },
    drawnAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)

DrawHistorySchema.index({ userId: 1, drawnAt: -1 })

export const DrawHistory: Model<IDrawHistory> = mongoose.models.DrawHistory || mongoose.model<IDrawHistory>('DrawHistory', DrawHistorySchema)
