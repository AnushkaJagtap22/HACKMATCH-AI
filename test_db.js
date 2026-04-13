const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./backend/models/User');

dotenv.config({ path: './backend/.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  try {
    const user = await User.findOne();
    if (!user) {
      console.log('No user found');
      process.exit(0);
    }
    console.log('Found user:', user.email, 'username:', user.username);
    
    // try to update username to ""
    try {
      await User.findByIdAndUpdate(user._id, { $set: { username: "" } }, { runValidators: false });
      console.log('Successfully set username to ""');
    } catch (err) {
      console.error('Error updating to "":', err.message);
    }

    // check users with empty username
    const emptyUsr = await User.find({ username: "" });
    console.log('Users with empty username:', emptyUsr.length);

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

run();
