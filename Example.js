import mongoose from 'mongoose';
import 'dotenv/config';
import { CSVExporter } from './MongoCollectionExporter.js';

// Good practices are to store your string on environment variables. This is just an example.
const yourDBConnectionString = 'mongodb+srv://user:password@cluster/YourDatabaseName'

const main = async () => {
    // Connect to the cluster AND database where the collection resides
    const myDatabaseConnection = await mongoose.connect(yourDBConnectionString);

    // Define Schema and Model
    const MyModelSchema = new myDatabaseConnection.Schema({
        inputTranscript: String,
        intent: String,
        intentGrouping: String,
        AWSsessionId: String,
        date: Date
    });

    // Define model name, Model Schema and Collection name
    // - Collection name IS case-sensitive.
    // - If you don't define a Collection Name, by default, mongoose will define your collection by model name - all lowercase
    const GenieTalksModel = myDatabaseConnection.model("YourModelName", MyModelSchema, "YourCollectionName")

    // Pass in a database connection, the collection name to export and a Aggregation query
    const result = await CSVExporter(GenieTalksModel, [
        {
            "$match": {
                "date": {
                    "$gte": new Date("2022-01-01"),
                    "$lt": new Date("2022-02-01")
                }
            }
        },
        { // Project on this aggregation is and should be used to order the indexes (columns) on the way you want them to be output.
            // Example below will output columns at the following order: inputTranscript,intentGrouping,intent,AWSsessionId
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
