const chai = require("chai"),
  expect = chai.expect,
  qb = require("../../src/query-builder"),
  QueryBuilder = qb.QueryBuilder,
  {
    queryArguments
  } = require("../../google-drive-details/test/fixtures/query-builder.js");

function init(queryArguments) {
  let query = new QueryBuilder(queryArguments);

  return {
    processedValue: query.handleValue(),
    inputValue: queryArguments.value,
    query: query
  };
}

describe("QueryBuilder", () => {
  describe("Query Argument Value Input Processing, when input 'value':", () => {
    context("is a string without commas", () => {
      let { processedValue, inputValue } = init(queryArguments.singleValue);

      it("returns the input value as string in array", () => {
        expect(processedValue).to.have.lengthOf(1);
        expect(inputValue).to.include(processedValue[0]);
      });
    });

    context("is a string with commas", () => {
      let { processedValue, inputValue } = init(queryArguments.doubleValue);

      it("should return an array built from the input value", () => {
        expect(processedValue).to.have.lengthOf(2);
        expect(inputValue).to.include(processedValue[0]);
        expect(inputValue).to.include(processedValue[1]);
      });
    });

    context("is an array", () => {
      let { processedValue, inputValue } = init(queryArguments.arrayOfTwoValue);

      it("should return the input value", () => {
        expect(inputValue).to.equal(processedValue);
      });
    });
  });

  describe("Query String, when arguments are:", () => {
    context("For contents from a single directory by id", () => {
      let qA = queryArguments.singleDirectory;
      let { query } = init(qA);

      it("returns a string that concatenates the value with 'in parents'", () => {
        expect(query.queryString).to.equal(`"${qA.value}" in parents`);
      });
    });

    context("For a single file by file name", () => {
      let qA = queryArguments.singleFile;
      let { query } = init(qA);

      it("returns a string that concatenates 'name contains' with the input value", () => {
        expect(query.queryString).to.equal(`name contains "${qA.value}"`);
      });
    });

    context("For contents from a multiple directories, based on ids", () => {
      let qA = queryArguments.multipleDirs;
      let { query } = init(qA);

      it("correctly builds a compoound query from a clause for each id", () => {
        expect(query.queryString).to.equal(
          `"${qA.value[0]}" in parents or "${qA.value[1]}" in parents`
        );
      });
    });
  });

  describe("Settings for collecting items from subdirectories under a given directory id", () => {
    let qA = queryArguments.subDirTwo;
    let { query } = init(qA);

    describe("The first query string", () => {
      it("returns concatenates the input value with 'in parents'", () => {
        expect(query.queryString).to.equal(`"${qA.value}" in parents`);
      });
    });

    describe("The query object", () => {
      let queryObject = query.queryObject;
      let keysInQueryObject = Object.keys(queryObject);

      it("includes keys that allow definition of a nested query", () => {
        expect(keysInQueryObject).to.include.members(["optParams", "depth"]);
      });
      it("has values that define a nested query", () => {
        expect(queryObject.depth).to.be.greaterThan(1);
      });
      it("has 'depth' value matches the 'subdirectoryDepth' input arugment", () => {
        expect(queryObject.depth).to.be.equal(qA.subdirectoryDepth);
      });
    });
  });
});
