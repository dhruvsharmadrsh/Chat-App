import e from "express";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";


export async function getRecommendedUsers(req, res) {
    try{
        const currentUserId = req.user.id;
        const currentUser= req.user;

        const recommendedUser= await User.find({
            $and: [
                {
                    _id:{$ne: currentUserId}

                },
                {_id: {$nin: currentUser.friends}},
                { isOnboarded : true},
            ],
        });

        res.status(200).json({
            success: true,
            recommendedUser,
        });
    }
    catch (error) {
        console.log("Error in getRecommendedUsers controller", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export async function getMyFriends(req, res) {
    try {
        const user=await User.findById(req.user.id).select("friends").populate("friends","fullName profilePicture nativeLanguage learningLanguage");

        res.status(200).json(user.friends)
        
    } catch (error) {
        console.log("Error in getMyFriends controller", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export async function sendFriendRequest(req, res) {

    try{
        const myId = req.user.id;
        const {id: recipientId} = req.params;

        // pevent sending friend request to self
        if(myId === recipientId){
            return res.status(400).json({
                message: "You cannot send friend request to yourself",
            });
        }
        // Recipent not found
        const recipient = await User.findById(recipientId);
        if(!recipient){
            return res.status(404).json({
                message: "Recipent not found",
            });
        }

        // Check if the friend request already exists
        if(recipient.friends.includes(myId)){
            return res.status(400).json({
                message: "You are already friends with this user",
            });

        }
        //check if req already exists
        const existingRequest = await FriendRequest.findOne({
            $or:[
                {
                    sender: myId,
                    recipient: recipientId,
                },
                {
                    sender: recipientId,
                    recipient: myId,
                }

            ],
        });
        if(existingRequest){
            return res.status(400).json({
                message: "Friend request already exists between you and this user",
            });
        }
        // Create a new friend request
        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        });

        res.status(201).json(friendRequest);

    }
    catch (error) {
        console.log("Error in sendFriendRequest controller", error.message);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const {id: requestId} = req.params;
        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest){
            return res.status(404).json({
                message: "Friend request not found",
            });
        }
        // verify that the current user is the recipient of the request
        if(friendRequest.recipient.toString() !== req.user.id){
            return res.status(403).json({
                message: "You are not authorized to accept this friend request",
            });
        }
        friendRequest.status = "accepted";
        await friendRequest.save();
        // add each user to each other's friends list
        // $addToSet will add the user to the friends list if it does not already exist
        // this is done to prevent duplicate entries in the friends list
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient },
        });
        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender },
        });

res.status(200).json({
    success: true,
    message: "Friend request accepted"});


    } catch (error) {
        console.log("Error in acceptFriendRequest controller", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function getFriendRequest(req, res) {
    try{
        const incomingReqs= await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate("sender","fullName profilePicture");

        res.status(200).json({
            
            incomingReqs,
            acceptReqs
        });
    }
    catch (error) {
        console.log("Error in getFriendRequest controller", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function getOutgoingFriendReqs(req, res) {
    try {
        // Get all outgoing friend requests for the current user
        // where the sender is the current user and the status is pending
        const outgoingRequests= await FriendRequest.find({
            sender: req.user.id,
            status: "pending",
        }).populate("recipient","fullName profilePicture nativeLanguage learningLanguage");
        // Populate the recipient field with user details
        // This will return the full name, profile picture, native language, and learning language of the recipient
        res.status(200).json({
            outgoingRequests,
        });
    } catch (error) {
        // Handle any errors that occur during the process
        // Log the error message to the console for debugging
        console.log("Error in getOutgoingFriendReqs controller", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }
}