import { pool } from '../utils/index.js';
import tables from '../utils/tables.js';

async function SELECT(table, queryParams) {
    try {
        if (!tables[table]) throw new Error(`Table ${table} does not exist`);

        const keys = Object.keys(queryParams);
        const values = Object.values(queryParams);
        const conditions = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');

        const query = `SELECT * FROM ${table} WHERE ${conditions}`;
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        return { error: error.message };
    }
}

async function INSERT(table, queryParams) {
    try {
        if (!tables[table]) throw new Error(`Table ${table} does not exist`);

        const keys = Object.keys(queryParams);
        const values = Object.values(queryParams);
        const columns = keys.join(', ');
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        return { error: error.message };
    }
}

async function UPDATE(table, queryParams, condition) {
    try {
        if (!tables[table]) throw new Error(`Table ${table} does not exist`);

        const keys = Object.keys(queryParams);
        const values = Object.values(queryParams);
        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

        const conditionKeys = Object.keys(condition);
        const conditionValues = Object.values(condition);
        const conditionClause = conditionKeys.map((key, index) => `${key} = $${keys.length + index + 1}`).join(' AND ');

        const query = `UPDATE ${table} SET ${setClause} WHERE ${conditionClause} RETURNING *`;
        const result = await pool.query(query, [...values, ...conditionValues]);
        return result.rows[0];
    } catch (error) {
        return { error: error.message };
    }
}

async function DELETE(table, condition) {
    try {
        if (!tables[table]) throw new Error(`Table ${table} does not exist`);

        const keys = Object.keys(condition);
        const values = Object.values(condition);
        const conditions = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');

        const query = `DELETE FROM ${table} WHERE ${conditions} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        return { error: error.message };
    }
}

export default { SELECT, INSERT, UPDATE, DELETE };