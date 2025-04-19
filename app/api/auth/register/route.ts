import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest){
    try {
        const {email, password} = await request.json();

        if(!email || ! password){
            return NextResponse.json(
                {error: "Email and Password are required"},
                {status: 400}
            );
        }
        await connectToDatabase()

        const existingUser = await User.findOne({email})

        // If the user already exists, throw this error
        if(existingUser){
            return NextResponse.json(
                {error: "Email is already registered"},
                {status: 400}
            );
        }

        // If the user is new
        await User.create({
            email,
            password
        })

        return NextResponse.json(
            {message: "User registered Successfully "},
            {status: 201}
        )
        
    } catch (error) {
        return NextResponse.json(
            {error: "Failed to register User"},
            {status: 500}
        ) 
    }
}