import path from "path";

export default ({ env }) => {
  // use SQLite when running locally
  if (env("CMS_DB_TYPE") === "SQLITE") {
    return {
      connection: {
        client: "sqlite",
        connection: {
          filename: path.join(
            __dirname,
            "..",
            "..",
            env("DATABASE_FILENAME", ".data/data.db")
          ),
        },
        useNullAsDefault: true,
      },
    };
  } else if (env("CMS_DB_TYPE") === "POSTGRES") {
    return {
      connection: {
        client: "postgres",
        connection: {
          host: env("DATABASE_HOST"),
          port: env.int("DATABASE_PORT", 5432),
          database: "cms", // hardcode this to CMS so we never accidentally conflict with other data
          user: env("DATABASE_USERNAME"),
          password: env("DATABASE_PASSWORD"),
          ssl: false,
        },
        debug: false,
      },
    };
  } else {
    throw new Error("Please specify CMS_DB_TYPE");
  }
};
