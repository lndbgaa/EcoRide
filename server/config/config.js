import "dotenv/config";

console.log(process.env.MYSQL_USER);

export default {
  development: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PWD,
    database: process.env.MYSQL_NAME,
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
  },
  production: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PWD,
    database: process.env.MYSQL_NAME,
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
  },
};
