import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const record = await prisma.dailyRecord.findUnique({
      where: { id }
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching record:', error)
    return NextResponse.json(
      { error: 'Failed to fetch record' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { sales, expenses, notes } = body

    const existingRecord = await prisma.dailyRecord.findUnique({
      where: { id }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }

    const profit = (sales || existingRecord.sales) - (expenses || existingRecord.expenses)

    const record = await prisma.dailyRecord.update({
      where: { id },
      data: {
        sales: sales !== undefined ? parseFloat(sales) : existingRecord.sales,
        expenses: expenses !== undefined ? parseFloat(expenses) : existingRecord.expenses,
        profit,
        notes: notes !== undefined ? notes : existingRecord.notes
      }
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error updating record:', error)
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const record = await prisma.dailyRecord.findUnique({
      where: { id }
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }

    await prisma.dailyRecord.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Record deleted successfully' })
  } catch (error) {
    console.error('Error deleting record:', error)
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    )
  }
}