const User = require("../modules/user")
const MailSender = require("../utils/mailSender")
const OTPVERIFY = require("../mail-template/OTPVERIFY")
const bcrypt = require("bcrypt")

exports.resetPassOTP = async(req,res)=>{
    try {
        const {email} = req.body;

        const user = User.findUserByEmail(email);
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const restPassExpire = new Date(Date.now() + 3600000);
        console.log("das",restPassExpire)

        MailSender.sendMail({
            email:email,
            subject:"RESET PASS OTP",
            html:OTPVERIFY(otp,user.firstName)
        })

        await User.updateOtpDetails({
            email:email,
            otp:otp,
            restPassExpire:restPassExpire
        })

        return res.status(200).json({
            success:true,
            message:"OTP SENT SUCCESS"
        })

        
    } catch (error) {
        console.log("SERVER ERROR",error);
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
}

exports.verifyOTP = async(req,res) =>{
    try {
        const {email,otp} = req.body;
        if(!email || !otp){
            return res.status(404).json({
                success:false,
                message:"please fill all details"
            })
        }

        const user = await User.findUserByEmail(email);

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User Not found"
            })
        }

        if(user.resetOtpExpire < Date.now()){
            return res.status(403).json({
                success:false,
                message:"OTP EXPIRED"
            })
        }

        if(user.resetPassOtp != otp){
            return res.status(401).json({
                success:false,
                message:"OTP NOT CORRECT"
            })
        }
 
        await User.updateOtpDetails({
            email:email,
            otp:null,
            optExpireTime:null
        })

        return res.status(200).json({
            success:true,
            message:"OTP VERIFIED SUCCESS"
        })

    } catch (error) {
        console.log("Server error",error);
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
}

exports.changePass = async(req,res) =>{
    try {
        const {email,newPass,confirmPass} = req.body;
        if(!email || !newPass || !confirmPass){
            return res.status(404).json({
                success:false,
                message:"All field required"
            })
        }

        if(newPass != confirmPass){
            return res.status(400).json({
                success:false,
                message:"Password not matched"
            })
        }
        
        const user = await User.findUserByEmail(email);

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User Not found"
            })
        }

        const Password = await bcrypt.hash(newPass,10);

        await User.changePass({
            email:email,
            hashPass:Password
        })

        return res.status(200).json({
            success:true,
            message:"Password Change Success"
        })
    
    } catch (error) {
        console.log("Server error",error);
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
}