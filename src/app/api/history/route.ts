import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { DrawHistory } from '@/models/DrawHistory'
import connectDB from '@/lib/mongoose'

// GET - 获取用户的抽奖历史
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')

    const history = await DrawHistory.find({ userId: session.user.id })
      .sort({ drawnAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await DrawHistory.countDocuments({ userId: session.user.id })

    return NextResponse.json({ history, total })
  } catch (error) {
    console.error('Get history error:', error)
    return NextResponse.json({ error: '获取历史记录失败' }, { status: 500 })
  }
}
