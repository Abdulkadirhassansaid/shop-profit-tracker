import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../lib/db'

export async function GET() {
  try {
    const records = await prisma.dailyRecord.findMany({
      orderBy: { date: 'desc' }
    })
    
    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, sales, expenses, notes } = body

    if (!date || sales === undefined || expenses === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const profit = sales - expenses
    
    const record = await prisma.dailyRecord.create({
      data: {
        date: new Date(date),
        sales: parseFloat(sales),
        expenses: parseFloat(expenses),
        profit,
        notes: notes || ''
      }
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error creating record:', error)
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    )
  }
}