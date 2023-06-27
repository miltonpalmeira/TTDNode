module.exports = {
  test: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: '1234',
      database: 'barriga',
    },
    migrations: {
      directory: 'src/migrations',
    },
    seeds: {
      directory: 'src/seeds',
    },
  },
  prod: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: '1234',
      database: 'seubarriga',
    },
    migrations: {
      directory: 'src/migrations',
    },
  },
};
