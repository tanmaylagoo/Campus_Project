const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const BlacklistToken = require('../models/blacklist.model.js');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({success:false, errors:errors.array()});
        }
        const {username, email, password, role}= req.body;
        const userExists= await User.findOne({email}
        );
        if(userExists){
            return res.status(400).json({success:false, message:'user already exists'})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            username,
            email,
            password:hashedPassword,
            role
        })
        const token = jwt.sign({
            _id:user._id, role:user.role
        }, process.env.JWT_SECRET, {expiresIn:'24h'})
        res.status(201).cookie('token', token, cookieOptions).json({
            success:true,
            message:'User registered successfully',
            user:{
                _id:user._id,
                username:user.username,
                email:user.email,
                role:user.role
            },
            token
        })

        
    } catch (error) {
        next(error);
        
    }
    
}

const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({success:false, errors:errors.array()})
        }
        const {email, password}=req.body;
        const user = await User.findOne({email}).select('+password')
        if(!user){
            return res.status(400).json({success:false, message:'Invalid email or password'})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(401).json({
                success:false, message:'Incorrect password'
            })
        }
        const token = jwt.sign({_id:user._id, role:user.role},
            process.env.JWT_SECRET, {expiresIn:'24h'}
        )
        res.status(200).cookie('token', token, cookieOptions).json({
            success:true,
            message:'Logged in successfully',
            user:{
                _id:user._id,
                username:user.username,
                email:user.email,
                role: user.role
            },
            token

        })
        
    } catch (error) {
        next(error);
        
    }
    
}





const logout = async (req, res, next) => {
    try {
        await BlacklistToken.create({token:req.token})
        res.status(200).clearCookie('token', cookieOptions).json({
            success:true,
            message:'Logged out successfully'
        })
        
    } catch (error) {
        
        next(error);
    }
    
}



const getProfile = async (req, res, next) => {
    try {
        res.status(200).json({
            success:true,
            user:req.user
        })
        
    } catch (error) {
        next(error);
        
    }
    
}

module.exports={
    register,
    login,
    logout,
    getProfile
}



