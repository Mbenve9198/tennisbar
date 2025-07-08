import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import MenuItem from "@/lib/models/MenuItem"

// POST /api/menu/bulk - Bulk operations on menu items
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { action, itemIds, updates } = await request.json()

    if (!action || !itemIds || !Array.isArray(itemIds)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: action, itemIds" },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case "make_available":
        result = await MenuItem.updateMany(
          { _id: { $in: itemIds } },
          { $set: { available: true, updatedAt: new Date() } }
        )
        break

      case "make_unavailable":
        result = await MenuItem.updateMany(
          { _id: { $in: itemIds } },
          { $set: { available: false, updatedAt: new Date() } }
        )
        break

      case "add_tag":
        if (!updates?.tag) {
          return NextResponse.json(
            { success: false, error: "Tag required for add_tag action" },
            { status: 400 }
          )
        }
        result = await MenuItem.updateMany(
          { _id: { $in: itemIds } },
          { 
            $addToSet: { tags: updates.tag },
            $set: { updatedAt: new Date() }
          }
        )
        break

      case "remove_tag":
        if (!updates?.tag) {
          return NextResponse.json(
            { success: false, error: "Tag required for remove_tag action" },
            { status: 400 }
          )
        }
        result = await MenuItem.updateMany(
          { _id: { $in: itemIds } },
          { 
            $pull: { tags: updates.tag },
            $set: { updatedAt: new Date() }
          }
        )
        break

      case "update_prices":
        if (!updates?.priceChange) {
          return NextResponse.json(
            { success: false, error: "Price change required for update_prices action" },
            { status: 400 }
          )
        }
        
        const { type, value } = updates.priceChange
        let priceUpdate = {}
        
        if (type === "percentage") {
          // Increase/decrease by percentage
          const items = await MenuItem.find({ _id: { $in: itemIds } })
          const bulkOps = items.map(item => {
            const newPrice = item.price * (1 + value / 100)
            return {
              updateOne: {
                filter: { _id: item._id },
                update: { 
                  $set: { 
                    price: Math.round(newPrice * 100) / 100, // Round to 2 decimals
                    updatedAt: new Date() 
                  } 
                }
              }
            }
          })
          result = await MenuItem.bulkWrite(bulkOps)
        } else if (type === "fixed") {
          // Add/subtract fixed amount
          result = await MenuItem.updateMany(
            { _id: { $in: itemIds } },
            { 
              $inc: { price: value },
              $set: { updatedAt: new Date() }
            }
          )
        }
        break

      case "delete":
        result = await MenuItem.deleteMany({ _id: { $in: itemIds } })
        break

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    // Calculate items affected based on operation type
    let itemsAffected = 0
    if (result) {
      itemsAffected = (result as any).modifiedCount || (result as any).deletedCount || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        itemsAffected,
        details: result
      },
      message: `Bulk operation ${action} completed successfully. ${itemsAffected} items affected.`
    })

  } catch (error) {
    console.error("Error in bulk operation:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 