const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');


const validator = require("validator");
const userModel = require("../models/userModel");


//create token
const createToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

//login user
const loginUser = async (req,res) => {
    const {email, password} = req.body;
    try{
        const user = await userModel.findOne({email})

        if(!user){
            return res.status(401).json({success:false,message: "User does not exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(401).json({success:false,message: "Invalid credentials"})
        }

        const token = createToken(user._id)
        res.json({success:true,token})
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message:"Server Error"})
    }
}

//register user
const registerUser = async (req,res) => {
    const {username,number, email, password} = req.body;
    try{
        // Validate required fields
        if(!username || !number || !email || !password){
            return res.status(400).json({success:false,message: "All fields are required"})
        }

        // Convert number to integer if it's a string
        const phoneNumber = typeof number === 'string' ? parseInt(number) : number;
        if(isNaN(phoneNumber)){
            return res.status(400).json({success:false,message: "Please enter a valid phone number"})
        }

        //check if user already exists (by email)
        const exists = await userModel.findOne({email})
        if(exists){
            return res.status(409).json({success:false,message: "User with this email already exists"})
        }

        // Check if phone number already exists
        const existsByNumber = await userModel.findOne({number: phoneNumber})
        if(existsByNumber){
            return res.status(409).json({success:false,message: "User with this phone number already exists"})
        }

        // validating email format & strong password
        if(!validator.isEmail(email)){
            return res.status(400).json({success:false,message: "Please enter a valid email"})
        }
        if(password.length<8){
            return res.status(400).json({success:false,message: "Please enter a strong password (minimum 8 characters)"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({username, number: phoneNumber, email, password: hashedPassword})
        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true,token})

    } catch(error){
        console.error('REGISTER ERROR:', error);
        if (error && error.code === 11000) {
            // Handle duplicate key errors
            const dupField = Object.keys(error.keyValue || {})[0] || 'field';
            const fieldName = dupField === 'email' ? 'email' : 
                            dupField === 'number' ? 'phone number' : 
                            dupField === 'name' ? 'name (old index - run: node drop_index.js)' : 
                            dupField;
            
            // Special message for the old 'name' index issue
            if (dupField === 'name') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Database index error. Please contact support or run: node drop_index.js' 
                });
            }
            
            return res.status(400).json({ 
                success: false, 
                message: `This ${fieldName} is already registered. Please use a different ${fieldName}.` 
            });
        }
        res.status(500).json({success:false,message:"Server Error"})
    }
}

const getUserProfile = async (req, res) => {
    try {
        // Accept either Authorization header or token header
        const tokenHeader = req.headers.authorization || req.headers.token;
        if (!tokenHeader) return res.status(401).json({ success: false, message: 'Not authorized' });

        const token = tokenHeader.startsWith('Bearer ') ? tokenHeader.split(' ')[1] : tokenHeader;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, message: 'Invalid token or server error' });
    }
};
  


module.exports = {loginUser, registerUser, getUserProfile};
  