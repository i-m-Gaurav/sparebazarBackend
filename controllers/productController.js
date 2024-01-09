const mongoose = require("mongoose");

let schema=new mongoose.Schema({ pname: String, pdesc: String, price: String,whatsappNumber:String, category: String, pimage:String ,priceNegotiable:String,addedBy:mongoose.Schema.Types.ObjectId,
  isApproved: {
    type: Boolean,
    default: false,
  },
  isSold:String,
  address:String,
    // default: No // default to not sold
    pLoc:{
      type:{
        type:String,
        enum:['Point'],
        default:'Point'
      },
      coordinates:{
        type:[Number]
      } 
    }
  })
  
  schema.index({pLoc:'2dsphere'});
  
  const Products = mongoose.model('Products',schema);

module.exports.search= (req, res) => {

    console.log(req.query)
  
    let latitude=req.query.loc.split(',')[0]
    let longitude=req.query.loc.split(',')[1]
    
    let search=req.query.search;
  
    Products.find({
      $or:[
        {pname:{$regex:new RegExp(search, 'i')}},
        {pdesc:{$regex:new RegExp(search, 'i')}},
        {price:{$regex:new RegExp(search, 'i')}},
        {category:{$regex:new RegExp(search, 'i')}},
      ],
      pLoc:{
        $near:{
          $geometry:{
            type:'Point',
            coordinates:[parseFloat(latitude),parseFloat(longitude)]
          },
          $maxDistance:500 * 1000,
        }
      }
    })
      .then((results) => {
        console.log('Search Results:', results);
        res.send({ message: 'Success', products: results })
      })
      .catch((err) => {
        console.error('Error in Search:', err);
        res.send({ message: 'server err' })
      })
  }




module.exports.addProduct= (req, res) => {
    console.log(req.body);
    console.log(req.file);
  
    const plat = req.body.plat;
    const plong = req.body.plong; 
    const pname = req.body.pname;
    const pdesc = req.body.pdesc;
    const price = req.body.price;
    const category = req.body.category;
    const pimage = req.file.path;
    const whatsappNumber=req.body.whatsappNumber;
    const priceNegotiable=req.body.priceNegotiable;
    const isSold=req.body.isSold;
    const addedBy=req.body.userId;
    const address=req.body.address;
  
  
    const product = new Products({ pname, pdesc, price,whatsappNumber, category, pimage,priceNegotiable,isSold,addedBy,address,
      pLoc:{type:'Point',coordinates:[plat,plong]} });
    product.save()
      .then(() => {
        res.send({ message: 'Product Added Successfully' })
      })
      .catch(() => {
        res.send({ message: 'server error' })
      })
  
  }

module.exports.editProduct= (req, res) => {
    console.log(req.body);
    console.log(req.file);
    const pid=req.body.pid;  
    const pname = req.body.pname;
    const pdesc = req.body.pdesc;
    const price = req.body.price;
    const category = req.body.category;
    const whatsappNumber=req.body.whatsappNumber;
    const priceNegotiable=req.body.priceNegotiable;
    const isSold=req.body.isSold;
    const address=req.body.address;
    let pimage='';
    // && req.file.pimage
    if(req.file)
    {
       pimage = req.file.path;
    }

    const addedBy=req.body.userId;
  
    let editObj={};

    if(pname){
      editObj.pname=pname;

    }
    if(pdesc){
      editObj.pdesc=pdesc;
      
    }
    if(price){
      editObj.price=price;
      
    }
    if(category){
      editObj.category=category;
      
    }
    if(whatsappNumber)
    {
      editObj.whatsappNumber=whatsappNumber;
    }
    if(priceNegotiable)
    {
      editObj.priceNegotiable=priceNegotiable;
    }
    if(isSold)
    {
      editObj.isSold=isSold;
    }
    if(pimage){
      editObj.pimage=pimage;
      
    }
    if(address)
    {
      editObj.address=address;
    }
    

    Products.updateOne({_id:pid},editObj,{new:true})
      .then((result) => {
        res.send({ message: 'Product Edited Successfully',product:result })
      })
      .catch(() => {
        res.send({ message: 'server error' })
      })
  
  }

module.exports.approveProducts = async (req, res) => {
  const pid = req.params.pId;

  try {
      // Find the product and wait for the operation to complete
      const result = await Products.findOne({ _id: pid });
      var isaprvd = !result.isApproved;
      console.log(isaprvd);

      // Update the product and wait for the operation to complete
      const updateResult = await Products.updateOne({ _id: pid }, { $set: { isApproved: isaprvd } });

      res.send({ message: 'Product approved Successfully', product: updateResult });
  } catch (e) {
      res.send({ message: 'Server error while updating ' + `\n ${e}` });
  }
}

module.exports.getProducts= (req, res) => {
  
    Products.find()
      .then((result) => {
        res.send({ message: 'Success', products: result })
      })
      .catch((err) => {
        res.send({ message: 'server err' })
      })
  }

module.exports.getProductsById=(req, res) => {
    Products.findOne({ _id: req.params.pId })
      .then((result) => {
        console.log(result, "user data")
        res.send({ message: 'Success', product: result })
      })
      .catch((err) => {
        res.send({ message: 'server err' })
      })
  }

module.exports.myProducts=(req, res) => {
    const userId=req.body.userId;
    Products.find({ addedBy: userId })
      .then((result) => {
        res.send({ message: 'Success', products: result })
      })
      .catch((err) => {
        res.send({ message: 'server err' })
      })
  }

module.exports.deleteProduct=(req,res)=>{
    Products.findByIdAndRemove(req.body.pid)
    .then(() => {
      res.send({ message: 'Product deleted successfully' });
    })
    .catch((error) => {
      console.error('Error deleting user:', error);
      res.status(500).send({ message: 'Server error' });
    });
}