import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMovie extends Document {
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
  addedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const MovieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: [true, '请提供影片名称'],
      trim: true,
      maxlength: [200, '影片名称不能超过200个字符'],
    },
    year: { type: String, default: '' },
    director: { type: String, default: '' },
    cast: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 10 },
    genre: { type: [String], default: [] },
    region: { type: String, default: '' },
    poster: { type: String, default: '' },
    doubanUrl: { type: String, default: '', index: true },
    watched: { type: Boolean, default: false },
    userRating: { type: Number, default: 0, min: 0, max: 10 },
    userReview: { type: String, default: '', maxlength: [2000, '影评不能超过2000个字符'] },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

MovieSchema.index({ addedBy: 1, createdAt: -1 })

// 删除旧模型缓存，确保使用新的 schema
if (mongoose.models.Movie) {
  delete mongoose.models.Movie
}

export const Movie: Model<IMovie> = mongoose.model<IMovie>('Movie', MovieSchema)
