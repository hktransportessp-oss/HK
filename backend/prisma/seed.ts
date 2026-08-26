import { PrismaClient, Role, DeliveryStatus, TripStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 0. Create or update ADMIN user (Everton)
  const adminPasswordHash = await argon2.hash('1992125223', {
    type: argon2.argon2id,
  });

  const adminUser = await prisma.user.upsert({
    where: { cpf: '40279319800' },
    update: {
      name: 'Everton',
      role: Role.ADMIN,
      status: 'ACTIVE',
      passwordHash: adminPasswordHash,
    },
    create: {
      name: 'Everton',
      cpf: '40279319800',
      role: Role.ADMIN,
      status: 'ACTIVE',
      passwordHash: adminPasswordHash,
    },
  });
  console.log('ADMIN user seeded:', adminUser.cpf);

  // Password hashing with Argon2id for driver demo
  const passwordHash = await argon2.hash('senha123', {
    type: argon2.argon2id,
  });

  // 1. Create or update DRIVER user
  const user = await prisma.user.upsert({
    where: { cpf: '38920184910' },
    update: {
      name: 'João da Silva',
      phone: '(11) 98765-4321',
      passwordHash,
      role: Role.DRIVER,
    },
    create: {
      name: 'João da Silva',
      cpf: '38920184910',
      phone: '(11) 98765-4321',
      passwordHash,
      role: Role.DRIVER,
    },
  });

  // 2. Create or update Driver record
  const driver = await prisma.driver.upsert({
    where: { userId: user.id },
    update: {
      cnh: '04829103920',
      cnhCategory: 'AE',
      rntrc: '8493021',
      status: 'ATIVO',
    },
    create: {
      userId: user.id,
      cnh: '04829103920',
      cnhCategory: 'AE',
      rntrc: '8493021',
      status: 'ATIVO',
    },
  });

  // 3. Create or update Vehicle
  const vehicle = await prisma.vehicle.upsert({
    where: { plate: 'ABC-1234' },
    update: {
      model: 'FH 540',
      brand: 'Volvo',
      year: 2023,
      status: 'DISPONIVEL',
    },
    create: {
      plate: 'ABC-1234',
      model: 'FH 540',
      brand: 'Volvo',
      year: 2023,
      status: 'DISPONIVEL',
    },
  });

  // 4. Create Driver Vehicle Assignment
  await prisma.driverVehicleAssignment.deleteMany({
    where: { driverId: driver.id },
  });

  await prisma.driverVehicleAssignment.create({
    data: {
      driverId: driver.id,
      vehicleId: vehicle.id,
      isCurrent: true,
    },
  });

  // 5. Create Sample Trips
  // Trip 1: ASSIGNED (Programada)
  const trip1 = await prisma.trip.upsert({
    where: { tripCode: 'TRIP-8849' },
    update: {
      driverId: driver.id,
      vehicleId: vehicle.id,
      status: TripStatus.ASSIGNED,
    },
    create: {
      tripCode: 'TRIP-8849',
      driverId: driver.id,
      vehicleId: vehicle.id,
      origin: 'São Paulo - SP',
      destination: 'Curitiba - PR',
      status: TripStatus.ASSIGNED,
      notes: 'Carga prioridade alta - Eletrônicos',
    },
  });

  // Trip 2: IN_PROGRESS (Em Andamento)
  const trip2 = await prisma.trip.upsert({
    where: { tripCode: 'TRIP-8850' },
    update: {
      driverId: driver.id,
      vehicleId: vehicle.id,
      status: TripStatus.IN_PROGRESS,
    },
    create: {
      tripCode: 'TRIP-8850',
      driverId: driver.id,
      vehicleId: vehicle.id,
      origin: 'Campinas - SP',
      destination: 'Joinville - SC',
      status: TripStatus.IN_PROGRESS,
      startDate: new Date(),
      notes: 'Lotação Fracionada',
    },
  });

  // Trip 3: COMPLETED (Concluída)
  const trip3 = await prisma.trip.upsert({
    where: { tripCode: 'TRIP-8851' },
    update: {
      driverId: driver.id,
      vehicleId: vehicle.id,
      status: TripStatus.COMPLETED,
    },
    create: {
      tripCode: 'TRIP-8851',
      driverId: driver.id,
      vehicleId: vehicle.id,
      origin: 'São Paulo - SP',
      destination: 'Rio de Janeiro - RJ',
      status: TripStatus.COMPLETED,
      startDate: new Date(Date.now() - 86400000 * 2),
      endDate: new Date(Date.now() - 86400000),
      notes: 'Viagem concluída sem ressalvas',
    },
  });

  // Create Stops for Trip 1
  await prisma.tripStop.deleteMany({ where: { tripId: trip1.id } });
  await prisma.tripStop.createMany({
    data: [
      {
        tripId: trip1.id,
        stopOrder: 1,
        locationName: 'CD SP Central',
        address: 'Av. das Nações Unidas, 12000 - SP',
        status: 'PENDING',
      },
      {
        tripId: trip1.id,
        stopOrder: 2,
        locationName: 'Distribuidora Curitiba',
        address: 'Rua das Indústrias, 500 - PR',
        status: 'PENDING',
      },
    ],
  });

  // Create Deliveries & Invoices for Trip 1
  await prisma.delivery.deleteMany({ where: { tripId: trip1.id } });
  const del1 = await prisma.delivery.create({
    data: {
      tripId: trip1.id,
      recipient: 'Electra Eletrônicos Ltda',
      address: 'Rua XV de Novembro, 1020',
      city: 'Curitiba',
      state: 'PR',
      sequence: 1,
      status: DeliveryStatus.PENDING,
    },
  });

  const del2 = await prisma.delivery.create({
    data: {
      tripId: trip1.id,
      recipient: 'Atacado Paraná S.A.',
      address: 'Av. Batel, 890',
      city: 'Curitiba',
      state: 'PR',
      sequence: 2,
      status: DeliveryStatus.PENDING,
    },
  });

  // Invoices for Trip 1
  await prisma.invoice.deleteMany({ where: { tripId: trip1.id } });
  await prisma.invoice.createMany({
    data: [
      {
        tripId: trip1.id,
        deliveryId: del1.id,
        number: '145892',
        accessKey: '35260838920184910001925500100014589210000001',
        recipient: 'Electra Eletrônicos Ltda',
        recipientDocument: '12.345.678/0001-90',
        address: 'Rua XV de Novembro, 1020',
        city: 'Curitiba',
        state: 'PR',
        postalCode: '80020-310',
        value: 45200.0,
        weight: 1250.0,
        volumeCount: 120,
      },
      {
        tripId: trip1.id,
        deliveryId: del2.id,
        number: '145893',
        accessKey: '35260838920184910001925500100014589310000002',
        recipient: 'Atacado Paraná S.A.',
        recipientDocument: '98.765.432/0001-10',
        address: 'Av. Batel, 890',
        city: 'Curitiba',
        state: 'PR',
        postalCode: '80420-090',
        value: 28400.0,
        weight: 850.0,
        volumeCount: 80,
      },
    ],
  });

  // CTe for Trip 1
  await prisma.cTe.deleteMany({ where: { tripId: trip1.id } });
  await prisma.cTe.create({
    data: {
      tripId: trip1.id,
      number: '4892',
      accessKey: '35260838920184910001925500100000489210000001',
      status: 'EMITIDO',
      value: 8500.0,
    },
  });

  // Deliveries for Trip 2 (In Progress)
  await prisma.delivery.deleteMany({ where: { tripId: trip2.id } });
  await prisma.delivery.create({
    data: {
      tripId: trip2.id,
      recipient: 'Sul Logistics Joinville',
      address: 'Distrito Industrial, 45',
      city: 'Joinville',
      state: 'SC',
      sequence: 1,
      status: DeliveryStatus.IN_ROUTE,
    },
  });

  // 6. Create Sample Romaneio
  await prisma.romaneio.upsert({
    where: { romaneioCode: 'ROM-2026-001' },
    update: { tripId: trip1.id, driverId: driver.id },
    create: {
      romaneioCode: 'ROM-2026-001',
      tripId: trip1.id,
      driverId: driver.id,
      notes: 'Romaneio de embarque com 12 paletes',
      status: 'APPROVED',
    },
  });

  // 7. Create Sample Toll
  await prisma.toll.create({
    data: {
      tripId: trip1.id,
      driverId: driver.id,
      amount: 42.5,
      date: '08/08/2026',
      plaza: 'Praça de Pedágio Regis Bittencourt KM 350',
      highway: 'BR-116',
      status: 'APPROVED',
    },
  });

  // 8. Create Sample Financial Settlement
  const settlement = await prisma.financialSettlement.upsert({
    where: { settlementCode: 'SET-2026-08' },
    update: { driverId: driver.id, tripId: trip1.id },
    create: {
      settlementCode: 'SET-2026-08',
      driverId: driver.id,
      tripId: trip1.id,
      periodStart: '01/08/2026',
      periodEnd: '08/08/2026',
      freightAmount: 8500.0,
      tollAmount: 420.0,
      additionalAmount: 150.0,
      deductionsAmount: 80.0,
      netAmount: 8990.0,
      status: 'APPROVED',
    },
  });

  console.log('Development database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
