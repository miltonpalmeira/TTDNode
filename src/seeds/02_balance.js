const moment = require('moment');

exports.seed = (knex) => {
  return knex('users')
    .insert([
      {
        id: 20100,
        name: 'User #3',
        mail: 'user3@mail.com',
        passwd: '$2a$10$BKWBistO5ExZbFFMfS7hPusyJRon6ayOmNoGG25NezVZ1WVwZ8txu',
      },
      {
        id: 20101,
        name: 'User #4',
        mail: 'user4@mail.com',
        passwd: '$2a$10$BKWBistO5ExZbFFMfS7hPusyJRon6ayOmNoGG25NezVZ1WVwZ8txu',
      },
      {
        id: 20102,
        name: 'User #5',
        mail: 'user5@mail.com',
        passwd: '$2a$10$BKWBistO5ExZbFFMfS7hPusyJRon6ayOmNoGG25NezVZ1WVwZ8txu',
      },
    ])
    .then(() =>
      knex('accounts').insert([
        { id: 20100, name: 'Acc Saldo Principal', user_id: 20100 },
        { id: 20101, name: 'Acc Saldo Secundário', user_id: 20100 },
        { id: 20102, name: 'Acc Alternativa 1', user_id: 20101 },
        { id: 20103, name: 'Acc Alternativa 2', user_id: 20101 },
        { id: 20104, name: 'Acc Geral Principal', user_id: 20102 },
        { id: 20105, name: 'Acc Geral Secundário', user_id: 20102 },
      ])
    )
  .then(() => knex('transfers').insert([
    { id: 20100, description: 'Transfer #1', user_id: 20102, acc_ori_id: 20105, acc_dest_id: 20104, ammount: 256, date: new Date() },
    { id: 20101, description: 'Transfer #2', user_id: 20101, acc_ori_id: 20102, acc_dest_id: 20103, ammount: 512, date: new Date() },
  ]))
  .then(() => knex('transactions').insert([
    // Transacao positiva / Saldo = 2
    { description: '2', date: new Date(), ammount: 2, type: 'I', acc_id: 20104, status: true },
    // Transacao usuario errado / Saldo = 2
    { description: '2', date: new Date(), ammount: 4, type: 'I', acc_id: 20102, status: true },
    // Transacao outra conta / Saldo = 2 / Saldo: 8
    { description: '2', date: new Date(), ammount: 8, type: 'I', acc_id: 20105, status: true },
    // Transacao pendente / Saldo = 2 / Saldo: 8
    { description: '2', date: new Date(), ammount: 16, type: 'I', acc_id: 20104, status: false },
    // Transacao passada / Saldo = 34 / Saldo: 8
    { description: '2', date: moment().subtract({ days: 5 }), ammount: 32, type: 'I', acc_id: 20104, status: true },
    // Transacao futura / Saldo = 34 / Saldo: 8
    { description: '2', date: moment().add({ days: 5 }), ammount: 64, type: 'I', acc_id: 20104, status: true },
    // Transacao negativa / Saldo = -94 / Saldo: 8
    { description: '2', date: moment(), ammount: -128, type: 'O', acc_id: 20104, status: true },
    // Transf / Saldo = 162 / Saldo: -248
    { description: '2', date: moment(), ammount: 256, type: 'I', acc_id: 20104, status: true },
    { description: '2', date: moment(), ammount: -256, type: 'O', acc_id: 20105, status: true },
    // Transf / Saldo = 162 / Saldo: -248
    { description: '2', date: moment(), ammount: 512, type: 'I', acc_id: 20103, status: true },
    { description: '2', date: moment(), ammount: -512, type: 'O', acc_id: 20102, status: true },
  ]));
};
