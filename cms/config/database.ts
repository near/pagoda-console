import path from "path";

export default ({ env }) => ({
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
});
