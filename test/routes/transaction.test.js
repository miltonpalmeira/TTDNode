const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

let user, user2, accUser, accUser2;

const MAIN_ROUTE = '/v1/transactions';

beforeAll(async () => {
  await app.db('transactions').del();
  await app.db('accounts').del();
  await app.db('users').del();
  const users = await app.db('users').insert(
    [
      {
        name: 'User #1',
        mail: `user@mail.com`,
        passwd: '$2a$10$3iQ4PSH6Eq54s163oU6wYeP3cCYF0PWGdBhZjUrfJejVn/8kgT5Cq',
      },
      {
        name: 'User #2',
        mail: `user2@mail.com`,
        passwd: '$2a$10$3iQ4PSH6Eq54s163oU6wYeP3cCYF0PWGdBhZjUrfJejVn/8kgT5Cq',
      },
    ],
    '*'
  );
  [user, user2] = users;
  delete user.passwd;
  user.token = jwt.encode(user, 'Segredo!');
  const accs = await app.db('accounts').insert(
    [
      { name: 'Acc #1', user_id: user.id },
      { name: 'Acc #1', user_id: user2.id },
    ],
    '*'
  );
  [accUser, accUser2] = accs;
});

test('Deve listar apenas as transações do usuário', () => {
  return app
    .db('transactions')
    .insert([
      {
        description: 'T1',
        date: new Date(),
        ammount: 100,
        type: 'I',
        acc_id: accUser.id,
      },
      {
        description: 'T2',
        date: new Date(),
        ammount: 300,
        type: 'I',
        acc_id: accUser2.id,
      },
    ])
    .then(() =>
      request(app)
        .get(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(1);
          expect(res.body[0].description).toBe('T1');
        })
    );
});

test('Deve inserir uma transação com sucesso', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({
      description: 'New T',
      date: new Date(),
      ammount: 100,
      type: 'I',
      acc_id: accUser.id,
    })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUser.id);
      expect(res.body.ammount).toBe('100.00');
    });
});

test('Transações de entrada devem ser positivas', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({
      description: 'New T',
      date: new Date(),
      ammount: -100,
      type: 'I',
      acc_id: accUser.id,
    })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUser.id);
      expect(res.body.ammount).toBe('100.00');
    });
});

test('Transações de saída devem ser negativas', () => {
  return request(app)
    .post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({
      description: 'New T',
      date: new Date(),
      ammount: 100,
      type: 'O',
      acc_id: accUser.id,
    })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUser.id);
      expect(res.body.ammount).toBe('-100.00');
    });
});

describe('Ao tentar inserir uma transação inválida', () => {
  // const validTransaction = {
  //   description: 'New T',
  //   date: new Date(),
  //   ammount: 100,
  //   type: 'O',
  //   acc_id: accUser.id,
  // };

  let validTransaction;
  beforeAll(() => {
    validTransaction = {
      description: 'New T',
      date: new Date(),
      ammount: 100,
      type: 'O',
      acc_id: accUser.id,
    };
  });

  const testTemplate = (newData, errorMessage) => {
    return request(app)
      .post(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .send({
        ...validTransaction,
        ...newData,
      })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem descrição', () =>
    testTemplate({ description: null }, 'Descrição é um atributo obrigatório'));

  test('Não deve inserir sem valor', () =>
    testTemplate({ ammount: null }, 'Valor é um atributo obrigatório'));

  test('Não deve inserir sem data', () =>
    testTemplate({ date: null }, 'Data é um atributo obrigatório'));

  test('Não deve inserir sem conta', () =>
    testTemplate({ acc_id: null }, 'Conta é um atributo obrigatório'));

  test('Não deve inserir sem tipo', () =>
    testTemplate({ type: null }, 'Tipo é um atributo obrigatório'));

  test('Não deve inserir com tipo inválido', () =>
    testTemplate({ type: 'A' }, 'Tipo inválido'));
});

test('Deve retornar uma transação por ID', () => {
  return app
    .db('transactions')
    .insert(
      {
        description: 'T ID',
        date: new Date(),
        ammount: 100,
        type: 'I',
        acc_id: accUser.id,
      },
      ['id']
    )
    .then((t) =>
      request(app)
        .get(`${MAIN_ROUTE}/${t[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.id).toBe(t[0].id);
          expect(res.body.description).toBe('T ID');
        })
    );
});

test('Deve alterar uma transação', () => {
  return app
    .db('transactions')
    .insert(
      {
        description: 'to Update',
        date: new Date(),
        ammount: 100,
        type: 'I',
        acc_id: accUser.id,
      },
      ['id']
    )
    .then((t) =>
      request(app)
        .put(`${MAIN_ROUTE}/${t[0].id}`)
        .send({ description: 'Updated' })
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.description).toBe('Updated');
        })
    );
});

test('Deve remover uma transação', () => {
  return app
    .db('transactions')
    .insert(
      {
        description: 'To Delete',
        date: new Date(),
        ammount: 100,
        type: 'I',
        acc_id: accUser.id,
      },
      ['id']
    )
    .then((t) =>
      request(app)
        .delete(`${MAIN_ROUTE}/${t[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
          expect(res.status).toBe(204);
        })
    );
});

test('Não deve remover uma transação de outro usuário', () => {
  return app
    .db('transactions')
    .insert(
      {
        description: 'To Delete',
        date: new Date(),
        ammount: 100,
        type: 'I',
        acc_id: accUser2.id,
      },
      ['id']
    )
    .then((t) =>
      request(app)
        .delete(`${MAIN_ROUTE}/${t[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
          expect(res.status).toBe(403);
          expect(res.body.error).toBe('Este recurso não pertence ao usuário');
        })
    );
});

test('Não deve remover uma conta com transação', () => {
  return app
    .db('transactions')
    .insert(
      {
        description: 'To Delete',
        date: new Date(),
        ammount: 100,
        type: 'I',
        acc_id: accUser.id,
      },
      ['id']
    )
    .then(() =>
      request(app)
        .delete(`/v1/accounts/${accUser.id}`)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.error).toBe('Essa conta possui transações associadas');
        })
    );
});