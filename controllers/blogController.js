const mongoose = require("mongoose");
const Blog = require("../models/blogModel.js");
const User = require("../models/userModel.js");
const validateMongoDbId = require("../utils/validateMongodbId.js");
const cloudinaryUploadImg = require("../utils/cloudinary.js");
const fs = require("fs");

// --------------------------------------------------------------------------------------------------------------
// Create A blog
const createBlog = async (req, res) => {
  try {
    const payload = req.body;
    const newBlog = await Blog.create(payload);
    return res.json({ success: true, blog: newBlog });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// -------------------------------------------------------------------------------------------------------------
// Update a blog
const updateBlog = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const payload = req.body;
  try {
    const updateBlog = await Blog.findByIdAndUpdate(id, payload, { new: true });
    return res.json({ success: true, blog: updateBlog });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};
// -------------------------------------------------------------------------------------------------------------
// Get  a blog
const getBlog = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getBlog = await Blog.findById(id)
      .populate("likes")
      .populate("dislikes");
    await Blog.findByIdAndUpdate(id, { $inc: { numViews: 1 } }, { new: true });
    return res.json({ success: true, blog: getBlog });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// -------------------------------------------------------------------------------------------------------------
// Get  a blog
const getAllBlog = async (req, res) => {
  try {
    const getBlogs = await Blog.find();
    return res.json({ success: true, blog: getBlogs });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// -------------------------------------------------------------------------------------------------------------
// Update a blog
const deleteBlog = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteBlog = await Blog.findByIdAndDelete(id);
    return res.json({ success: true, blog: deleteBlog });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Lile A Blog

const likeBlog = async (req, res) => {
  const { blogId } = req.body;
  console.log(req.body);
  validateMongoDbId(blogId);
  //   Find the Blog which you want to be liked
  const blog = await Blog.findById(blogId);

  //   Find the Login user
  const loginUserId = req?.user?._id; //req && req.user && req.user._id;

  //   Find if the User liked the Blog
  const isLiked = blog?.isLiked;

  // Find if the user is dislike the blog
  const alreadyDisliked = blog?.dislikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Dislike A Blog

const dislikeBlog = async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId);
  //   Find the Blog which you want to be disliked
  const blog = await Blog.findById(blogId);

  //   Find the Login user
  const loginUserId = req?.user?._id; //req && req.user && req.user._id;

  //   Find if the User disliked the Blog
  const isDisLiked = blog?.isDisliked;

  // Find if the user is dislike the blog
  const alreadyLiked = blog?.likes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
  if (isDisLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
};

// --------------------------------------------------------------------------------------------------
// Upload Images

const uploadImages = async (req, res) => {
  // console.log(req.files);

  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      fs.unlinkSync(path);
      // console.log(newpath);
    }
    const findBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      {
        new: true,
      }
    );

    return res.json({
      success: true,
      findBlog,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadImages,
};
