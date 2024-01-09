const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
const Users = mongoose.model("Users", {
  username: String,
  password: String,
  name: String,
  phone: Number,
  about: String,
  likedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Products" }],
});

module.exports.likeProducts = (req, res) => {
  let productId = req.body.productId;
  let userId = req.body.userId;

  console.log(req.body);

  Users.updateOne({ _id: userId }, { $addToSet: { likedProducts: productId } })
    .then(() => {
      res.send({ message: "liked Success." });
    })
    .catch(() => {
      res.send({ message: "Server Err" });
    });
};

module.exports.dislikeProducts = (req, res) => {
  let productId = req.body.productId;
  let userId = req.body.userId;

  console.log(req.body);

  Users.updateOne({ _id: userId }, { $pull: { likedProducts: productId } })
    .then(() => {
      res.send({ message: "Disliked Success." });
    })
    .catch(() => {
      res.send({ message: "Server Err" });
    });
};

module.exports.signup = (req, res) => {
  console.log(req.body);

  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  const phone = req.body.phone;
  const about = req.body.about;

  const user = new Users({
    username: username,
    password: password,
    name: name,
    phone: phone,
    about: about,
  });
  user
    .save()
    .then(() => {
      res.send({ message: "saved successfully" });
    })
    .catch(() => {
      res.send({ message: "server error" });
    });
};

module.exports.likedProducts = (req, res) => {
  Users.findOne({ _id: req.body.userId })
    .populate("likedProducts")
    .then((result) => {
      res.send({ message: "Success", products: result.likedProducts });
    })
    .catch((err) => {
      res.send({ message: "server err" });
    });
};

module.exports.myProfileById = (req, res) => {
  let uid = req.params.uId;
  console.log("Received request for user ID:", uid);

  Users.findOne({ _id: uid })
    .then((result) => {
      if (result) {
        res.send({
          message: "success",
          user: {
            username: result.username,
            name: result.name,
            phone: result.phone,
            about: result.about,
          },
        });
      } else {
        res.status(404).send({ message: "User not found" });
      }
    })
    .catch((error) => {
      console.error(error); // Log the error for debugging purposes
      res.status(500).send({ message: "Server Error" });
    });
};

module.exports.getAllUsers = (req, res) => {
  Users.find({})
    .then((users) => {
      res.send(users);
    })
    .catch((error) => {
      console.error("Error getting users:", error);
      res.status(500).send({ message: "Server error" });
    });
};

module.exports.deleteUser = (req, res) => {
  const userId = req.body.uId;

  Users.findByIdAndRemove(userId)
    .then(() => {
      res.send({ message: "User deleted successfully" });
    })
    .catch((error) => {
      console.error("Error deleting user:", error);
      res.status(500).send({ message: "Server error" });
    });
};

module.exports.getUserById = (req, res) => {
  const _userId = req.params.uId; // Use req.params.uId to get the user ID

  Users.findOne({ _id: _userId })
    .then((result) => {
      if (result) {
        res.send({ message: "Success", user: result });
      } else {
        res.send({ message: "User not found" });
      }
    })
    .catch((err) => {
      console.error("Error fetching user:", err);
      res.send({ message: "server err" });
    });
};

module.exports.login = (req, res) => {
  // console.log(req.body);

  const username = req.body.username;
  const password = req.body.password;

  Users.findOne({ username: username })
    .then((result) => {
      // console.log(result, " user data");
      if (!result) {
        console.log(" user not found");
        res.send({ message: "User Not Found" });
      } else {
        if (result.password == password) {
          const token = jwt.sign(
            {
              data: result,
            },
            "MYKEY",
            { expiresIn: 60 }
          );
          console.log(result, " user data is correct ");
          res.send({
            message: "Find successfully",
            token: token,
            userId: result._id,
            username: result.username,
          });
        }
        if (result.password != password) {
          console.log(" password data is wrong ");
          res.send({ message: "Password is Wrong" });
        }
      }
    })
    .catch(() => {
      res.send({ message: " error" });
    });
};

module.exports.editProfile = (req, res) => {
  const userId = req.params.userId;
  const { name, phone, about } = req.body;

  // Update user data directly based on received values
  Users.findByIdAndUpdate(
    userId,
    {
      name: name || undefined,
      phone: phone || undefined,
      about: about || undefined,
    },
    { new: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).send({ message: "User not found" });
      }

      return res.send({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    })
    .catch((error) => {
      console.error("Error updating user profile:", error);
      return res.status(500).send({ message: "Server error" });
    });
};

//ADMIN LOGIN
const Admin = mongoose.model("Admin", {
  username: String,
  password: String,
  // Add a role field in the admin to differentiate the admin and normal user.
  role: { type: String, default: "admin" }
});

module.exports.adminlogin = (req, res) => {
  // console.log(req.body);

  const username = req.body.username;
  const password = req.body.password;
  

  Admin.findOne({ username: username })
    .then((result) => {
      // console.log(result, " user data");
      if (!result) {
        console.log(" user not found");
        res.send({ message: "User Not Found" });
      } else {
        if (result.password == password) {
          const token = jwt.sign(
            {
              userId: result._id,// Include user ID in the token
              data: result,
              role: result.role  // Include role in the token
            },
            "MYKEY",
            { expiresIn: 60 }
          );
          console.log(result, " admin data is correct ");
          res.send({
            message: "Find successfully",
            token: token,
            userId: result._id,
            username: result.username,
            role: result.role // Send role in the response
          });
        }
        if (result.password != password) {
          console.log(" password data is wrong ");
          res.send({ message: "Password is Wrong" });
        }
      }
    })
    .catch(() => {
      res.send({ message: " error" });
    });
};
