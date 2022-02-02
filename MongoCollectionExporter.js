import * as fs from 'fs/promises';

// Would be better to use MongoDB driver directly to avoid unecessary usage of third-party libraries.
// Also, there is no error handling. This IS a prototype.

export async function CSVExporter(dbModel, aggregationQuery) {
    console.log("Querying the database. It may take a while...")

    // Make the query to the database through mongoose model
    const queryResult = await dbModel.aggregate(aggregationQuery);

    // Return feedback to the user
    console.log(`Query found ${queryResult.length} documents in the collection ${dbModel.collection.collectionName} `);

    // Export result data to CSV
    await _Export(queryResult, `Exp_${dbModel.collection.collectionName}_${new Date().toISOString().split(':').join('')}`);
}

async function _Export(collection, outFileName, separator = ',') {
    // Visual feedback to user
    console.log("Exporting to CSV...")

    // Create an empty array to store values
    let dataArr = []

    // Generate and push columns index to writeable array
    const columnIndex = await genColumnsIndex(collection);
    dataArr.push(columnIndex[0])


    // Generate CSV lines
    collection.forEach(document => {

        // Create an empty string
        let tempStr = "";

        // Iterate through enumerable document object and extract column values
        Object.entries(document).forEach(([key, value]) => {
            tempStr += `${value}${separator}`;
        });

        // Remove last character if it is a separator
        if (tempStr.charAt(tempStr.length - 1) === separator) {
            tempStr = tempStr.slice(0, tempStr.length - 1);
        }

        // Append to data array
        dataArr.push(tempStr)
    });

    const write = await fs.writeFile(`${outFileName}.csv`, dataArr.join('\r\n'), 'utf8');

    console.log(`All data exported to ${outFileName}.csv`)
};

async function genColumnsIndex(collection, separator = ',') {

    const indexKeys = Object.keys(collection[0]);

    let tempStr = '';
    let i = 0;

    indexKeys.forEach((indexKey) => {

        if (indexKey !== indexKeys[indexKeys.length - 1]) {
            tempStr += `${indexKey}${separator}`;
        } else {
            tempStr += `${indexKey}`;

        }
        i++;
    })

    const resultStr = `${tempStr}\n`;

    return [tempStr, indexKeys]
};