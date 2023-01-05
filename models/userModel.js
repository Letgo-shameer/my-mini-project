const mongoose = require("mongoose");
const Product = require("../models/productModel");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    mobile: {
        type: String,
    },
    password: {
        type: String,
    },
    address:{
      type:String,
      
    },
    city:{
      type:String,
      
    }, 
    state:{
      type:String,
      
    },
    zip:{
      type:String,
    
    },
    is_admin: {
        type: Number,
        required: true,
    },
    isVerified: {
        type: Number,
        default: 1,
    },
    cart:{
        item:[{
            productId:{
                type:mongoose.Types.ObjectId,
                ref:'Product',
                required:true
            },
            qty:{
                type:Number,
                required:true
            },
            price:{
                type:Number
            },
            name:{
                type:String,
                required:true
            },
            image:{
                type:String,
                required:true
            }
        }],
        totalPrice:{
            type:Number,
            default:0
        }
    },
    wishlist: {
        item:[{
          productId:{
           type:mongoose.Types.ObjectId,
           ref:'Product',
           required:true
          }
        }]
     }
});

userSchema.methods.addToCart = function (product) {
    const cart = this.cart
    const isExisting = cart.item.findIndex(objInItems => {
        return new String(objInItems.productId).trim() == new String(product._id).trim()
    })
    if(isExisting >=0){
        cart.item[isExisting].qty +=1
    }else{
        cart.item.push({
            productId:product._id,
            qty:1,price:product.price,
            name:product.name,
            image:product.image[0],
            })
    } 
    cart.totalPrice += product.price
    return this.save()
}

userSchema.methods.removefromCart =async function (productId){
    const cart = this.cart
    const isExisting = cart.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
    if(isExisting >= 0){
        const prod = await Product.findById(productId)
        cart.totalPrice -= prod.price * cart.item[isExisting].qty
        cart.item.splice(isExisting,1)
        return this.save()
    } 
}

userSchema.methods.addToWishlist = function (productid) {
    const wishlist = this.wishlist
    const isExisting = wishlist.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productid).trim())
    if(isExisting <0){
        wishlist.item.push({productId:productid,
        })   
    }  
    return this.save()  
  }
  
  userSchema.methods.removeFromWishlist =async function (productid){
    const wishlist = this.wishlist
    const isExisting = wishlist.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productid).trim())
    if(isExisting >= 0){  
      wishlist.item.splice(isExisting,1)  
        return this.save()
    }
  }



module.exports = mongoose.model("User", userSchema);
