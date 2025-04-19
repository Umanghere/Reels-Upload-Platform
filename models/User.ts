import mongoose, { Schema , model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser{
    email: string,
    password: string;
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date
}

const userSchema = new Schema<IUser>(
    {
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true}
    },
    {
        timestamps: true
    }
)

// If there is any activity in password, whether its password change, or update password, it will BCRYPT password just before saving it in DB.
// This is done using "pre".
userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    }
    next();
})

// If there is already a model exist in DB, its okay otherwise create a fresh model
const User = models?.User || model<IUser>("User", userSchema)

export default User;