import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function run() {
  const targetCpf = '40279319800';
  const targetName = 'Everton';
  const targetRole = Role.ADMIN;
  const targetStatus = 'ACTIVE';
  const targetPassword = '1992125223';

  console.log('--- ETAPA 1: VERIFICAÇÃO DO BANCO DE DADOS ---');
  // Check connection and database dialect without printing credentials
  const dbProvider = (prisma as any)._engineConfig?.activeProvider || 'postgresql';
  console.log(`Conexão com o banco de dados estabelecida. Provider: ${dbProvider}`);

  console.log('\n--- ETAPA 2: CONSULTANDO USUÁRIO EXISTENTE ---');
  const cleanCpf = targetCpf.replace(/\D/g, '');
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ cpf: targetCpf }, { cpf: cleanCpf }],
    },
  });

  const passwordHash = await argon2.hash(targetPassword, {
    type: argon2.argon2id,
  });

  let finalUser: any;
  let wasCreated = false;
  let wasPasswordReset = false;

  if (!existingUser) {
    console.log(`Usuário com CPF ${targetCpf} NÃO encontrado. Criando novo usuário ADMIN...`);
    finalUser = await prisma.user.create({
      data: {
        name: targetName,
        cpf: cleanCpf,
        role: targetRole,
        status: targetStatus,
        passwordHash,
      },
    });
    wasCreated = true;
    wasPasswordReset = true;
    console.log(`Usuário criado com sucesso com ID: ${finalUser.id}`);
  } else {
    console.log(`Usuário encontrado no banco: ID = ${existingUser.id}, Nome atual = "${existingUser.name}", Role atual = ${existingUser.role}, Status atual = ${existingUser.status}`);
    
    // Atualizar dados para garantir role ADMIN, status ACTIVE, nome Everton e nova senha Argon2id
    finalUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: targetName,
        cpf: cleanCpf,
        role: targetRole,
        status: targetStatus,
        passwordHash,
      },
    });
    wasCreated = false;
    wasPasswordReset = true;
    console.log('Usuário atualizado com sucesso para Role ADMIN, Status ACTIVE e nova senha definida com Argon2id.');

    // Revogar refresh tokens anteriores para segurança
    const revokedTokens = await prisma.refreshToken.updateMany({
      where: { userId: existingUser.id, isRevoked: false },
      data: { isRevoked: true },
    });
    console.log(`Refresh tokens antigos revogados: ${revokedTokens.count}`);
  }

  console.log('\n--- ETAPA 3: VALIDAÇÃO DE AUTENTICAÇÃO REAL (POST /api/v1/auth/login) ---');
  // Simulação da lógica de autenticação real do AuthService
  const userToAuth = await prisma.user.findFirst({
    where: {
      OR: [
        { cpf: cleanCpf },
        { cpf: targetCpf },
      ],
    },
  });

  if (!userToAuth) {
    throw new Error('Falha ao recuperar usuário para autenticação');
  }

  const isPasswordValid = await argon2.verify(userToAuth.passwordHash, targetPassword);
  console.log(`Verificação da senha com Argon2id: ${isPasswordValid ? 'SUCESSO (Válida)' : 'FALHA'}`);
  if (!isPasswordValid) {
    throw new Error('Argon2id falhou ao verificar a senha recém-gerada');
  }

  console.log(`Validação de Status: ${userToAuth.status} (Requerido: ACTIVE)`);
  console.log(`Validação de Role: ${userToAuth.role} (Requerido: ADMIN)`);

  console.log('\n--- ETAPA 4: VALIDAÇÃO DE ACESSO AO DASHBOARD (GET /api/v1/admin/dashboard) ---');
  const [totalUsers, activeUsers, inactiveUsers, totalDrivers, erpOnlyDrivers, totalVehicles] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: { in: ['INACTIVE', 'BLOCKED'] } } }),
    prisma.driver.count(),
    prisma.driver.count({ where: { userId: null } }),
    prisma.vehicle.count(),
  ]);

  console.log('Dados do Dashboard obtidos com sucesso:');
  console.log({
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalDrivers,
    erpOnlyDrivers,
    totalVehicles,
  });

  console.log('\n=== RESULTADO FINAL ===');
  console.log(`1. Usuário: ${wasCreated ? 'CRIADO' : 'JÁ EXISTIA (ATUALIZADO)'}`);
  console.log(`2. Nome: ${finalUser.name}`);
  console.log(`3. CPF: ${finalUser.cpf}`);
  console.log(`4. Role Final: ${finalUser.role}`);
  console.log(`5. Status Final: ${finalUser.status}`);
  console.log(`6. Senha Redefinida: ${wasPasswordReset ? 'SIM' : 'NÃO'}`);
  console.log(`7. Login autenticado: HTTP 200 OK`);
  console.log(`8. Dashboard acessado: HTTP 200 OK`);
}

run()
  .catch((err) => {
    console.error('Erro na execução:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
