const { poolPromise } = require('../config/db');

async function getUserRequests(userID) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', userID)
      .query('SELECT RequestID, RequestDetails, RequestStatus, CreatedAt FROM Requests WHERE UserID = @UserID ORDER BY CreatedAt DESC');

    return {
      success: true,
      requests: result.recordset
    };
  } catch (error) {
    console.error('Error fetching user requests:', error);
    return {
      success: false,
      message: 'Server error fetching requests'
    };
  }
}

module.exports = { getUserRequests };