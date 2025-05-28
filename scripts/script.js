const { sql, poolPromise } = require('../config/db'); // Adjust the path to your dbConfig file

// List of tables and their VARCHAR columns with lengths
const varcharColumns = [
    { table: 'Users', column: 'Username', length: '25' },
    { table: 'Users', column: 'Email', length: '254' },
    { table: 'Users', column: 'PasswordHash', length: '255' },
    { table: 'Users', column: 'UserType', length: '5' },
    { table: 'Users', column: 'Image', length: '255' },
    { table: 'AdminPanelLogs', column: 'ActionDescription', length: 'MAX' },
    { table: 'Communities', column: 'ChatName', length: '30' },
    { table: 'Communities', column: 'Keywords', length: '150' },
    { table: 'Communities', column: 'Image', length: '255' },
    { table: 'Genres', column: 'Name', length: '20' },
    { table: 'Requests', column: 'Status', length: '50' },
    { table: 'Requests', column: 'Description', length: '500' },
    { table: 'Requests', column: 'ContentType', length: '5' }
];

async function changeVarcharToNvarchar() {
    try {
        // Use the existing poolPromise from dbConfig
        const pool = await poolPromise;
        console.log('Using existing database connection.');

        // Generate and execute ALTER TABLE statements
        for (const col of varcharColumns) {
            const length = col.length === 'MAX' ? 'MAX' : `(${col.length})`;
            const query = `ALTER TABLE ${col.table} ALTER COLUMN ${col.column} NVARCHAR${length}`;
            try {
                await pool.request().query(query);
                console.log(`Successfully changed ${col.table}.${col.column} to NVARCHAR${length}`);
            } catch (err) {
                console.error(`Error altering ${col.table}.${col.column}:`, err.message);
            }
        }

        console.log('All VARCHAR columns have been processed.');
    } catch (err) {
        console.error('Error during execution:', err.message);
    } finally {
        // No need to close the pool since it's managed by dbConfig
        console.log('Script execution completed.');
    }
}

// Run the script
changeVarcharToNvarchar().catch(err => console.error('Script execution failed:', err));