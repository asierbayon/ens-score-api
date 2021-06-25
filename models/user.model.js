const mongoose = require('mongoose');
const Schema = mongoose.Schema
const createError = require('http-errors');

const userSchema = new Schema({
  username: {
    type: String,
    required: 'An username is required.',
    unique: true,
    lowercase: true,
    minlength: [3, 'Your username is too short'],
    maxlength: [35, 'Your username is too long'],
    validate: (value) => {
      if (!validator.isAlphanumeric(value)) {
        throw new Error('Your username can only contain letters and numbers');
      }
    },
  },
  avatar: {
    type: String,
    default: function () {
      return `https://avatars.dicebear.com/api/identicon/${this.username}.svg`
    },
  },
  coverImage: {
    type: String,
    default: function () {
      return `https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80`
    }
  },
  website: {
    type: String,
    validate: (value) => {
      if (value && !validator.isURL(value, { require_protocol: true })) {
        throw new Error('Invalid URL.');
      }
    },
    maxlength: [65, 'This URL is too long.'],
  },
  ethAddress: {
    type: String,
    validate: (value) => {
      if (value && !validator.isEthereumAddress(value)) {
        throw new Error('Invalid Ethereum address.');
      }
    },
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = doc._id;
      delete ret._id;
      delete ret.__v;
      return ret
    }
  },
  toObject: {
    transform: (doc, ret) => {
      ret.id = doc._id;
      delete ret._id;
      delete ret.__v;
      return ret
    },
    virtuals: true
  }
});


userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    bcrypt.hash(this.password, 10).then((hash) => {
      this.password = hash;
      next();
    });
  } else {
    next();
  }
});

userSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const document = await User.findOne({ username: this.username });
      if (document) return next(createError(400, 'A user with that email or username already exists.'));
    } catch (err) {
      return next(createError(400));
    }
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
