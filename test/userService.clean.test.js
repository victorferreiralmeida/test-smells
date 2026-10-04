const { UserService } = require('../src/userService');

const usuarioPadrao = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

describe('UserService - Suíte de Testes limpos', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('cria um usuário adulto com status ativo e identificador definido', () => {
    // Arrange
    const { nome, email, idade } = usuarioPadrao;

    // Act
    const usuario = userService.createUser(nome, email, idade);

    // Assert
    expect(usuario).toEqual(
      expect.objectContaining({
        nome,
        email,
        idade,
        status: 'ativo',
        isAdmin: false,
      })
    );
    expect(usuario.id).toEqual(expect.any(String));
    expect(usuario.id.length).toBeGreaterThan(0);
  });

  test('permite buscar um usuário recém-criado pelo identificador', () => {
    // Arrange
    const criado = userService.createUser(
      usuarioPadrao.nome,
      usuarioPadrao.email,
      usuarioPadrao.idade
    );

    // Act
    const encontrado = userService.getUserById(criado.id);

    // Assert
    expect(encontrado).toEqual(
      expect.objectContaining({
        id: criado.id,
        nome: usuarioPadrao.nome,
        email: usuarioPadrao.email,
        status: 'ativo',
      })
    );
  });

  test('desativa um usuário comum e persiste o status inativo', () => {
    // Arrange
    const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

    // Act
    const desativou = userService.deactivateUser(usuarioComum.id);
    const atualizado = userService.getUserById(usuarioComum.id);

    // Assert
    expect(desativou).toBe(true);
    expect(atualizado.status).toBe('inativo');
  });

  test('não desativa um usuário administrador e mantém o status ativo', () => {
    // Arrange
    const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

    // Act
    const desativou = userService.deactivateUser(usuarioAdmin.id);
    const atualizado = userService.getUserById(usuarioAdmin.id);

    // Assert
    expect(desativou).toBe(false);
    expect(atualizado.status).toBe('ativo');
  });

  test('inclui no relatório os nomes dos usuários cadastrados', () => {
    // Arrange
    userService.createUser('Alice', 'alice@email.com', 28);
    userService.createUser('Bob', 'bob@email.com', 32);

    // Act
    const relatorio = userService.generateUserReport();

    // Assert
    expect(relatorio).toEqual(expect.any(String));
    expect(relatorio).toMatch(/Alice/);
    expect(relatorio).toMatch(/Bob/);
  });

  test('indica ausência de cadastros quando não há usuários', () => {
    // Arrange
    // O banco em memória já é limpo no beforeEach.

    // Act
    const relatorio = userService.generateUserReport();

    // Assert
    expect(relatorio).toEqual(expect.any(String));
    expect(relatorio.toLowerCase()).toMatch(/nenhum usuário/);
  });

  test('rejeita a criação de usuário menor de idade', () => {
    // Arrange
    const criarMenorDeIdade = () =>
      userService.createUser('Menor', 'menor@email.com', 17);

    // Act & Assert
    expect(criarMenorDeIdade).toThrow(/maior de idade/i);
  });
});
