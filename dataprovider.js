import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('database.sqlite3');

db.serialize(() => {
    const sql = `CREATE TABLE IF NOT EXISTS webhooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        user TEXT,
        webhook_id TEXT,
        webhook_secret TEXT
    )`;
    db.run(sql);
});

export async function getWebhooksByUserID(user_id) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM webhooks WHERE user = ?`, [user_id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export async function getWebhookByIdAndSecret(webhook_id, webhook_secret) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM webhooks WHERE webhook_id = ? AND webhook_secret = ?`, [webhook_id, webhook_secret], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

export async function getWebhookByUserIdAndInternalID(user_id, index) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM webhooks WHERE user = ? AND id = ?`, [user_id, index], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function make_webhook_id() {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 19) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function make_webhook_secret() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 68) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export async function createWebhook(user, name) {
    const webhook_id = make_webhook_id();
    const webhook_secret = make_webhook_secret();
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO webhooks (name, user, webhook_id, webhook_secret) VALUES (?, ?, ?, ?)`, [name, user, webhook_id, webhook_secret], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

export async function deleteWebhookByUserAndInternalId(user_id, index) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM webhooks WHERE user = ? AND id = ?`, [user_id, index], function (err) {
            if (err) {
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
}
