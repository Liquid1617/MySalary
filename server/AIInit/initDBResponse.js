const { DataSource } = require("typeorm");

const datasource = new DataSource({
  type: "postgres",
  url: "postgres://postgres:@localhost:5432/mysalary",
});

module.exports = {
  datasource
}