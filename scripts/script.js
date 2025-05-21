const { sql, poolPromise } = require('../config/db'); // Adjust path to your dbConfig file

async function checkTables() {
    let pool;
    try {
        // Get the connection pool
        pool = await poolPromise;
        console.log('Connected to database');

        // Tables to check
        const tables = ['Communities', 'Messages', 'Favorites'];

        // Check columns for each table
        for (const table of tables) {
            const columns = await pool.request().query(`
                SELECT COLUMN_NAME, DATA_TYPE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = '${table}'
                ORDER BY ORDINAL_POSITION
            `);
            console.log(`\nColumns in ${table}:`);
            if (columns.recordset.length > 0) {
                columns.recordset.forEach(row => {
                    console.log(`  - ${row.COLUMN_NAME} (${row.DATA_TYPE})`);
                });
            } else {
                console.log(`  No columns found or table does not exist.`);
            }
        }

        // Check foreign key constraints for each table
        for (const table of tables) {
            const foreignKeys = await pool.request().query(`
                SELECT 
                    fk.name AS constraint_name,
                    OBJECT_NAME(fk.referenced_object_id) AS referenced_table,
                    c.name AS referenced_column
                FROM sys.foreign_keys fk
                INNER JOIN sys.foreign_key_columns fkc 
                    ON fk.object_id = fkc.constraint_object_id
                INNER JOIN sys.columns c 
                    ON fkc.referenced_object_id = c.object_id 
                    AND fkc.referenced_column_id = c.column_id
                WHERE OBJECT_NAME(fk.parent_object_id) = '${table}'
            `);
            console.log(`\nForeign Key Constraints in ${table}:`);
            if (foreignKeys.recordset.length > 0) {
                foreignKeys.recordset.forEach(row => {
                    console.log(`  - ${row.constraint_name} references ${row.referenced_table}(${row.referenced_column})`);
                });
            } else {
                console.log(`  No foreign key constraints found.`);
            }
        }

        // Check unique constraints and indexes for each table
        for (const table of tables) {
            const uniqueConstraints = await pool.request().query(`
                SELECT 
                    name AS constraint_name,
                    CASE WHEN is_unique_constraint = 1 THEN 'Unique Constraint' ELSE 'Index' END AS type
                FROM sys.indexes
                WHERE OBJECT_NAME(object_id) = '${table}' 
                    AND (is_unique = 1 OR is_unique_constraint = 1)
                    AND is_primary_key = 0
            `);
            console.log(`\nUnique Constraints/Indexes in ${table}:`);
            if (uniqueConstraints.recordset.length > 0) {
                uniqueConstraints.recordset.forEach(row => {
                    console.log(`  - ${row.constraint_name} (${row.type})`);
                });
            } else {
                console.log(`  No unique constraints or unique indexes found.`);
            }
        }

        // Check primary key constraints for each table
        for (const table of tables) {
            const primaryKeys = await pool.request().query(`
                SELECT name AS constraint_name
                FROM sys.key_constraints
                WHERE type = 'PK' 
                    AND OBJECT_NAME(parent_object_id) = '${table}'
            `);
            console.log(`\nPrimary Key Constraint in ${table}:`);
            if (primaryKeys.recordset.length > 0) {
                primaryKeys.recordset.forEach(row => {
                    console.log(`  - ${row.constraint_name}`);
                });
            } else {
                console.log(`  No primary key constraint found.`);
            }
        }

    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    } finally {
        // Close the pool connection
        if (pool) {
            await pool.close();
            console.log('\nDatabase connection closed');
        }
    }
}

checkTables().catch(err => {
    console.error('Script execution failed:', err);
    process.exit(1);
});