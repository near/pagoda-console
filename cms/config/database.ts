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
    const connectionString = env("DATABASE_CONNECTION_STRING");
    if (typeof connectionString !== "string") {
      throw new Error("Please provide a DATABASE_CONNECTION_STRING");
    }
    if (!/postgresql:\/\/.+:.+@.+\/cms($|\?.+)/.test(connectionString)) {
      throw new Error(
        "Safeguard: Connection string must target database `cms` to protect against accidental conflict with other Console data"
      );
    }
    return {
      connection: {
        client: "postgres",
        connection: {
          connectionString,
          ssl: false,
        },
        debug: false,
      },
    };
  } else {
    throw new Error("Please specify CMS_DB_TYPE");
  }
};
