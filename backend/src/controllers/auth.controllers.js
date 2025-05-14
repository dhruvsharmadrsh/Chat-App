import User from "../models/User.js";
import jwt from "jsonwebtoken";

import { upsertStreamUser } from "../lib/stream.js";

export async function signup(req, res) {
  const { fullName, email, password } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists, please use a diffrent one" });
    }
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    try{
        await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
    });
    console.log(`Stream user created successfully ${newUser.fullName}`);
    }
    catch(error){
        console.log("Error creating stream user",error);
    }

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 100,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV == "production",
    });
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try{
    const {email,password}=req.body;

    if(!email || !password){
        return res.status(400).json({message:"All fields are required"});
    }
    const user =await User.findOne({ email });
    if(!user) return res.status(401).json({message:"Invalid email or password"});

  const isPasswordCorrect=await user.matchPassword(password);

  if(!isPasswordCorrect) return res.status(401).json({message:"Invalid email or password"});

  const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 100,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV == "production",
    });

    res.status(200).json({success:true,user});

}
catch(error){
console.log("Error in login controller",error.message);
res.status(500).json({message:"Internal Server Error"});
}
}

export async function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({success:true,message:"Logout Successful"});
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, bio, nativeLanguage, learningLanguage, location } =
      req.body;
    // Validate the input
    if (
      !fullName ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      return res
        .status(400)
        .json({
          message: "Please fill all the fields",
          missingFeilds: [
            !fullName && "fullName",
            !bio && "bio",
            !nativeLanguage && "nativeLanguage",
            !learningLanguage && "learningLanguage",
            !location && "location",
          ].filter(Boolean),
        });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body, // update the user with the new data
        isOnboarded: true, // set the isOnboarded field to true
      },
      { new: true }
    );

    if(!updatedUser) {
      return res.status(404).json({ message: "User 4 not found" });
    }

    // TODO: Implement the function to upsert Stream user
    try {
        await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.fullName,
      image: updatedUser.profilePic || "",

    });
    console.log(`Stream user updated successfully ${updatedUser.fullName}`);
    } catch (streamError) {
        console.log("Error updating stream user", streamError.message);
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.log("Error in onboard controller", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
});
}
}