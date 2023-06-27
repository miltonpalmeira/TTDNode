exports.seed = (knex) => {
  return knex('transactions')
    .del()
    .then(() => knex('transfers').del())
    .then(() => knex('accounts').del())
    .then(() => knex('users').del())
    .then(() =>
      knex('users')
        .insert([
          {
            id: 20000,
            name: 'User #1',
            mail: `user1@mail.com`,
            passwd:
              '$2a$10$3iQ4PSH6Eq54s163oU6wYeP3cCYF0PWGdBhZjUrfJejVn/8kgT5Cq',
          },
          {
            id: 20001,
            name: 'User #2',
            mail: `user2@mail.com`,
            passwd:
              '$2a$10$3iQ4PSH6Eq54s163oU6wYeP3cCYF0PWGdBhZjUrfJejVn/8kgT5Cq',
          },
        ])
        .then(() =>
          knex('accounts').insert([
            {
              id: 20000,
              name: 'AccO #1',
              user_id: 20000,
            },
            {
              id: 20001,
              name: 'AccD #1',
              user_id: 20000,
            },
            {
              id: 20002,
              name: 'AccO #2',
              user_id: 20001,
            },
            {
              id: 20003,
              name: 'AccD #2',
              user_id: 20001,
            },
          ])
        )
        .then(() =>
          knex('transfers').insert([
            {
              id: 20000,
              description: 'Transfer #1',
              user_id: 20000,
              acc_ori_id: 20000,
              acc_dest_id: 20001,
              ammount: 100,
              date: new Date(),
            },
            {
              id: 20001,
              description: 'Transfer #2',
              user_id: 20001,
              acc_ori_id: 20002,
              acc_dest_id: 20003,
              ammount: 100,
              date: new Date(),
            },
          ])
        )
        .then(() =>
          knex('transactions').insert([
            {
              description: 'Transfer from AccO #1',
              date: new Date(),
              ammount: 100,
              type: 'I',
              acc_id: 20001,
              transfer_id: 20000,
            },
            {
              description: 'Transfer to AccD #1',
              date: new Date(),
              ammount: -100,
              type: 'O',
              acc_id: 20000,
              transfer_id: 20000,
            },
            {
              description: 'Transfer from AccO #2',
              date: new Date(),
              ammount: 100,
              type: 'I',
              acc_id: 20003,
              transfer_id: 20001,
            },
            {
              description: 'Transfer to AccD #2',
              date: new Date(),
              ammount: -100,
              type: 'O',
              acc_id: 20002,
              transfer_id: 20001,
            },
          ])
        )
    );
};
