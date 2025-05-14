import mongoose from "mongoose";
// This schema defines the structure of a friend request document in MongoDB
// It includes the sender and recipient user IDs, as well as the status of the request
const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// The timestamps option automatically adds createdAt and updatedAt fields to the schema
const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema); // 

export default FriendRequest;