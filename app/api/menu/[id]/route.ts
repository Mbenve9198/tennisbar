import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import MenuItem from "@/lib/models/MenuItem"

// GET /api/menu/[id] - Get single menu item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const item = await MenuItem.findById(params.id)

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: item
    })

  } catch (error) {
    console.error("Error fetching menu item:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/menu/[id] - Update menu item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const updates = await request.json()

    // Remove fields that shouldn't be updated directly
    const { _id, ...allowedUpdates } = updates
    
    // Add update timestamp
    allowedUpdates.updatedAt = new Date()

    const updatedItem = await MenuItem.findByIdAndUpdate(
      params.id,
      allowedUpdates,
      { new: true, runValidators: true }
    )

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "Item updated successfully"
    })

  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/menu/[id] - Delete menu item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const deletedItem = await MenuItem.findByIdAndDelete(params.id)

    if (!deletedItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 