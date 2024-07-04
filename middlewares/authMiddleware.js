const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const checkAuth = async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (error) {
      return res.send({
        Status: "failed",
        Message: "No Authorized token Plese Login again",
      });
    }
  } else {
    return res.send({
      Status: "failed",
      Message: "There is no token Attech with Headers",
    });
  }
};
const isAdmin = async (req, res, next) => {
  // console.log(req.user);
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (adminUser.role !== "admin") {
    return res.send({
      Status: "failed",
      Message: "You are not Admin ",
    });
  } else {
    next();
  }
};
// module.exports = { checkAuth, isAdmin };
//------------------------------------------------------------------------------
// token pass in header without bearer

// const jwt = require("jsonwebtoken");
// const User = require("../models/userModel.js");

// const checkAuth = async (req, res, next) => {
//   const token = req.headers.authorization;

//   if (!token) {
//     return res.status(401).send({
//       Status: "failed",
//       Message: "There is no token attached with Headers",
//     });
//   }

//   try {
//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // Find the user by decoded ID
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(401).send({
//         Status: "failed",
//         Message: "User not found, please login again",
//       });
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     return res.status(401).send({
//       Status: "failed",
//       Message: "No Authorized token, please login again",
//     });
//   }
// };

// const isAdmin = async (req, res, next) => {
//   const { email } = req.user;

//   try {
//     const adminUser = await User.findOne({ email });
//     if (!adminUser || adminUser.role !== "admin") {
//       return res.status(403).send({
//         Status: "failed",
//         Message: "You are not Admin",
//       });
//     } else {
//       next();
//     }
//   } catch (error) {
//     return res.status(500).send({
//       Status: "failed",
//       Message: "Server error, please try again later",
//     });
//   }
// };

module.exports = { checkAuth, isAdmin };
