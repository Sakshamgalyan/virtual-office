import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

async function connectTODb() {
    const dbUrl = process.env.DB_URL;

    if (!dbUrl) {
        throw new Error("DB_URL environment variable is not defined");
    }

    try {
        client = new MongoClient(dbUrl);
        await client.connect();

        const dbName = process.env.DB_NAME || "smart-office";
        db = client.db(dbName);

        console.log(`Connected to DB: ${dbName}`);
    } catch (err: any) {
        console.error("Database connection error:", err);
        throw err;
    }
}

export const getDatabase = (): Db => {
    if (!db) {
        throw new Error("Database not initialized. Call connectTODb first.");
    }
    return db;
};

export default connectTODb;