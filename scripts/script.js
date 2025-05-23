const { poolPromise } = require('../config/db'); // Adjust path to your db config

async function updateUserImages() {
  try {
    const pool = await poolPromise;

    // Query all users with .jpg images
    const result = await pool.request()
      .query("SELECT UserID, Username, Image FROM Users WHERE Image LIKE '%.jpg'");

    const users = result.recordset;

    if (users.length === 0) {
      console.log('No users with .jpg images found.');
      return;
    }

    for (const user of users) {
      const newImage = user.Image.replace('.jpg', '.png');
      try {
        await pool.request()
          .input('UserID', user.UserID)
          .input('Image', newImage)
          .query('UPDATE Users SET Image = @Image WHERE UserID = @UserID');
        console.log(`Updated image for UserID ${user.UserID} (${user.Username}): ${user.Image} -> ${newImage}`);
      } catch (error) {
        console.error(`Error updating image for UserID ${user.UserID} (${user.Username}):`, error.message);
      }
    }

    console.log('All image updates completed.');
  } catch (error) {
    console.error('Error connecting to database or querying users:', error.message);
  } finally {
    // Close the database connection
    await pool.close();
  }
}

// Run the script
updateUserImages().catch((error) => {
  console.error('Script execution failed:', error.message);
});