const express = require('express')
const cors = require('cors')
const path = require('path')
var jwt = require('jsonwebtoken');
const productController=require('./controllers/productController');
const userController=require('./controllers/userController');
require('dotenv').config();


const multer = require('multer')
const http=require('http');
const {Server}=require("socket.io");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })
const bodyParser = require('body-parser')

const app = express() //accept restapi
const httpServer=http.createServer(app);

const io=new Server(httpServer,{
  cors:{
    origin:'*'
  }
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = 4000



const mongoose = require("mongoose");
const { Socket } = require('dgram');
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("mongoose connected ")
}).catch((e) => {
  console.log("not connected")
  console.log(e)
})

// get 
app.get('/', (req, res) => {
  res.send('Backend is Running!!')
})
app.get('/search',productController.search);

app.get('/get-products',productController.getProducts);

app.get('/get-users',userController.getAllUsers);

app.get('/get-product/:pId',productController.getProductsById );

app.get('/get-user/:uId', userController.getUserById);


app.get('/my-profile/:uId',userController.myProfileById);

// post 
app.post('/signup', userController.signup);

app.post('/like-product', userController.likeProducts)

app.post('/dislike-product', userController.dislikeProducts)

app.post('/liked-products', userController.likedProducts);

app.post('/my-products', productController.myProducts);

app.post('/add-product', upload.single('pimage'),productController.addProduct)

app.post('/edit-product', upload.single('pimage'),productController.editProduct)

app.post('/approve-product/:pId',productController.approveProducts)

app.post('/edit-profile/:userId', userController.editProfile);

app.post('/login', userController.login);

app.post('/admin-login', userController.adminlogin);


// delete
app.delete('/delete-user/',userController.deleteUser);

app.delete('/delete-product',productController.deleteProduct);


let messages=[]

io.on('connection',(socket)=>{
  console.log('socket connected',socket.id);

  socket.on('sendMsg',(data)=>{
    messages.push(data);
    io.emit('getMsg',messages);
  })
  io.emit('getMsg',messages);
  
})

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})