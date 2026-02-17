import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IParticipant {
  userId: string
  name: string
  isHost: boolean
  joinedAt: Date
  selectedMovies: string[] // 该用户选择的影片ID列表
}

export interface IDrawResult {
  movieId: string
  movieTitle: string
  drawnAt: Date
  seed: number
}

export interface IRoom extends Document {
  code: string
  hostId: string
  participants: IParticipant[]
  status: 'waiting' | 'drawing' | 'completed'
  drawResult?: IDrawResult
  createdAt: Date
  updatedAt: Date
}

const ParticipantSchema = new Schema<IParticipant>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  isHost: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
  selectedMovies: [{ type: String, default: [] }],
})

const DrawResultSchema = new Schema<IDrawResult>({
  movieId: { type: String, required: true },
  movieTitle: { type: String, required: true },
  drawnAt: { type: Date, default: Date.now },
  seed: { type: Number, required: true },
})

const RoomSchema = new Schema<IRoom>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      length: 6,
    },
    hostId: { type: String, required: true },
    participants: [ParticipantSchema],
    status: {
      type: String,
      enum: ['waiting', 'drawing', 'completed'],
      default: 'waiting',
    },
    drawResult: DrawResultSchema,
  },
  { timestamps: true }
)

export const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema)
