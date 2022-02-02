import mongoose from 'mongoose';
import 'dotenv/config';
import { CSVExporter } from './MongoCollectionExporter.js';


const main = async () => {
    // Connect to the cluster AND database where the collection resides
    const myDatabase = await mongoose.connect(process.env.DB_CONNECTION_STRING);

    // Define Schema and Model
    const MyModelSchema = new myDatabase.Schema({
        inputTranscript: String,
        intent: String,
        intentGrouping: String,
        AWSsessionId: String,
        date: Date
    });

    // Define model name, Model Schema and Collection name
    const GenieTalksModel = myDatabase.model("YourModelName", MyModelSchema, "YourCollectionName")

    // Pass in a database connection, the collection name to export and a Aggregation query
    const result = await MongoCSVExport(GenieTalksModel, [
        {
            "$match": {
                "date": {
                    "$gte": new Date("2022-01-01"),
                    "$lt": new Date("2022-01-02")
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                "inputTranscript": "$inputTranscript",
                "intentGrouping": "$intentGrouping",
                "intent": "$intent",
                "AWSsessionId": "$AWSsessionId"
            }
        }
    ]);

    process.exit();
}

main();
