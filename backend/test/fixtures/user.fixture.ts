import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../src/modules/users/entities/user.entity';
import { RoleEnum } from '../../src/common/enums/role.enum';
import { UserStatusEnum } from '../../src/common/enums/user-status.enum';

export const TEST_PASSWORD = 'TestPass123!';

export interface TestUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: RoleEnum;
  status: UserStatusEnum;
}

export const testUsers: Record<string, TestUserData> = {
  renter: {
    name: 'Test Renter',
    email: 'renter@test.com',
    password: TEST_PASSWORD,
    phone: '+15551234567',
    role: RoleEnum.RENTER,
    status: UserStatusEnum.ACTIVE,
  },
  renter2: {
    name: 'Another Renter',
    email: 'renter2@test.com',
    password: TEST_PASSWORD,
    role: RoleEnum.RENTER,
    status: UserStatusEnum.ACTIVE,
  },
  admin: {
    name: 'Test Admin',
    email: 'admin@test.com',
    password: TEST_PASSWORD,
    role: RoleEnum.ADMIN,
    status: UserStatusEnum.ACTIVE,
  },
  suspendedRenter: {
    name: 'Suspended Renter',
    email: 'suspended@test.com',
    password: TEST_PASSWORD,
    role: RoleEnum.RENTER,
    status: UserStatusEnum.SUSPENDED,
  },
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function createTestUser(
  dataSource: DataSource,
  userData: TestUserData,
): Promise<User> {
  const repository = dataSource.getRepository(User);
  const hashedPassword = await hashPassword(userData.password);
  const user = repository.create({
    ...userData,
    password: hashedPassword,
  });
  return repository.save(user);
}

export async function seedTestUsers(
  dataSource: DataSource,
): Promise<Record<string, User>> {
  const renter = await createTestUser(dataSource, testUsers.renter);
  const renter2 = await createTestUser(dataSource, testUsers.renter2);
  const admin = await createTestUser(dataSource, testUsers.admin);
  const suspended = await createTestUser(dataSource, testUsers.suspendedRenter);
  return { renter, renter2, admin, suspended };
}

export async function createUsers(
  dataSource: DataSource,
  users: TestUserData[],
): Promise<User[]> {
  return Promise.all(users.map((u) => createTestUser(dataSource, u)));
}
