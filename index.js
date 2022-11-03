const fs = require("fs");
const crypto = require("crypto");
const { parse } = require("csv-parse");
const readline = require("readline");
const fileDir = "./input_folder/all-team/NFT Naming csv - Pry bar.csv";

const run = async () => {
  const firstRow = (await getFirstLine(fileDir)).split(",");

  const teamJson = await convertCsvToJson(fileDir, firstRow);
  console.log(teamJson);
};

async function convertCsvToJson(pathToFile, attr) {
  const body = [];

  const teamCsvFile = fs.createReadStream(pathToFile).pipe(
    parse({
      delimiter: ",",
      from_line: 2,
      to_line: 20,

      columns: attr,
    })
  );
  return await new Promise((resolve) => {
    teamCsvFile
      .on("data", function (row) {
        const hash = crypto
          .createHash("sha256")
          .update(JSON.stringify(row))
          .digest("hex");

        body.push({ ...row, hash });

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

run();
