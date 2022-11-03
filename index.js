//import required lilbraries
const fs = require("fs");
const crypto = require("crypto");
const { parse } = require("csv-parse");
const converter = require("json-2-csv");
const readline = require("readline");
const path = require("path");
const { writeFile } = require("fs/promises");
const defaultFileDir =
  "./input_folder/all-team/NFT Naming csv - Team Bevel.csv";

//main function to acommodate async operations
const run = async (cliFilePath = null) => {
  //get filepath from stdin or use default value
  const fileDir = cliFilePath || defaultFileDir;
  const firstRow = (await getFirstLine(fileDir)).split(",");

  //converting to json from csv using a function
  const teamJson = await convertCsvToJson(fileDir, firstRow);

  //converting to csv from json using a function
  const teamCsv = await convertJsonToCsv(teamJson);

  //getting filename from path provided
  const fileName = path.parse(fileDir);

  //writing result to a file
  await writeFile(`${fileName.name}.output.csv`, teamCsv);

  // console.log(JSON.stringify(teamJson, null, 2));
  process.stdout.write(teamCsv);

  process.exit();
};
async function convertJsonToCsv(csvData) {
  return await new Promise((resolve) => {
    converter.json2csv(csvData, (err, csv) => {
      if (err) {
        throw err;
      }

      // print CSV string
      resolve(csv);
    });
  });
}

async function convertCsvToJson(pathToFile, attr) {
  const body = [];

  const teamCsvFile = fs.createReadStream(pathToFile).pipe(
    parse({
      delimiter: ",",
      from_line: 2,

      columns: attr,
    })
  );
  return await new Promise((resolve) => {
    teamCsvFile
      .on("data", function (row) {
        const newData = {
          format: "CHIP-0007",
          name: row.Filename,
          description: row.Description,
          minting_tool: "",
          sensitive_content: "false",
          series_number: row["Series Number"],
          series_total: 380,
          attributes: [
            {
              trait_type: "Gender",
              value: row?.Gender,
            },
          ],
          collection: {
            name: "Zuri NFT Tickets for Free lunch",
            id: row?.UUID,
            attributes: [
              {
                type: "description",
                value: "Rewards for accomplishments during HNGi9",
              },
            ],
          },
        };

        const hash = crypto
          .createHash("sha256")
          .update(JSON.stringify(newData))
          .digest("hex");

        body.push({ ...newData, Hash: hash });

        return row;
      })
      .on("end", () => {
        resolve(body);
      });
  });
}
async function getFirstLine(pathToFile) {
  const readable = fs.createReadStream(pathToFile);
  const reader = readline.createInterface({ input: readable });
  const line = await new Promise((resolve) => {
    reader
      .on("line", (line) => {
        reader.close();
        resolve(line);
      })
      .on("error", (data) => {
        console.log(data);
      });
  });
  readable.close();
  return line;
}

console.log(
  "Input the team csv file path you want to use or leave blank to use the team bevel version"
);

process.stdin.on("data", (data) => {
  let fileDir = data.toString().trim();

  fileDir.length && path.resolve(fileDir);

  console.log(
    `${
      data.toString().trim().length ? `You type  ${fileDir}` : "you typed none"
    }`
  );

  run(fileDir);
});
