// Post users/register
// Post users/login
import express from 'express'
import UserModel from '../db/user_model.ts'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'

dotenv.config();


interface RegisterUserRequest {
    username: string
    email: string
    password: string
}

interface LoginUserRequest {
    email: string
    password: string
}

const SECRET_KEY: string | undefined = process.env.SECRET_KEY;

const emailExists = async (email: string): Promise<boolean> => {
    return !!(await UserModel.findOne({ email }))
}

const usernameExists = async (username: string): Promise<boolean> => {
    return !!(await UserModel.findOne({ username }))
}

export const registerUser = async (req: Request<{}, {}, RegisterUserRequest>, res: Response) => {
    try {
        const { username, email, password } = req.body

        if (!email || !username || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (await emailExists(email)) {
            return res.status(400).json({ message: 'Email already exists' })
        }

        if (await usernameExists(username)) {
            return res.status(400).json({ message: 'username already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new UserModel({ username, email, password: hashedPassword })
        await newUser.save()

        res.status(200).json({message: 'User registered succesfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Server error', error})
    }
}

export const loginUser = async (req: Request<{}, {}, LoginUserRequest>, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'email does not exists' })
        }

        const check = await bcrypt.compare(password, user.password);
        if (!check) {
            return res.status(400).json({ message: 'Invalid password' })
        }

        const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: "4h" })
        
        res.status(200).json({ message: 'Login successful', token })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Server error', error})
    }
}
