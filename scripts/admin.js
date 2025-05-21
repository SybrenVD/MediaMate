const { poolPromise } = require('../config/db.js');

async function updateProfilePicture() {
  try {
    const pool = await poolPromise;
    const newImage = '/images/DefaultUser.jpg';
    const userID = 1;

    const result = await pool.request()
      .input('UserID', userID)
      .input('Image', newImage)
      .query(`
        UPDATE Users
        SET image = @Image
        WHERE UserID = @UserID;
        SELECT UserID, Username, Email, UserType, Image 
        FROM Users 
        WHERE UserID = @UserID
      `);

    if (result.recordset.length === 0) {
      console.log('User with UserID = 1 not found');
      return { success: false, message: 'User not found' };
    }

    console.log('Profile picture updated successfully for user:', result.recordset[0]);
    return { 
      success: true, 
      user: result.recordset[0]
    };
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return { success: false, message: 'Server error during profile picture update' };
  }
}

// Run the script
updateProfilePicture()
  .then(result => {
    if (!result.success) {
      console.log('Update failed:', result.message);
    }
  })
  .catch(err => console.error('Script error:', err));