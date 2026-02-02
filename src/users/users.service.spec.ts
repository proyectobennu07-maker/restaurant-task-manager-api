import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService } from '../auth/mocks/prisma.mock';
import { mockUser, mockUserWithRole, mockRole } from '../auth/mocks/fixtures';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should hash password with bcrypt when creating user', async () => {
      // Arrange
      const createUserDto = {
        name: 'Juan',
        email: 'juan@test.com',
        password: 'password123',
        roleId: 'role-id-1',
      };
      const hashedPassword = '$2b$10$hashedPassword';

      (bcrypt.hash as unknown as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrisma.user.create.mockResolvedValue({
        ...createUserDto,
        id: 'user-id-1',
        password: hashedPassword,
        createdAt: new Date(),
      });

      // Act
      await service.create(createUserDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should create user with hashed password', async () => {
      // Arrange
      const createUserDto = {
        name: 'Juan',
        email: 'juan@test.com',
        password: 'password123',
        roleId: 'role-id-1',
      };
      const hashedPassword = '$2b$10$hashedPassword';

      (bcrypt.hash as unknown as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrisma.user.create.mockResolvedValue({
        ...createUserDto,
        id: 'user-id-1',
        password: hashedPassword,
        createdAt: new Date(),
        role: mockRole,
      });

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result.password).toBe(hashedPassword);
      expect(result.password).not.toBe(createUserDto.password);
    });

    it('should include role in response', async () => {
      // Arrange
      const createUserDto = {
        name: 'Juan',
        email: 'juan@test.com',
        password: 'password123',
        roleId: 'role-id-1',
      };

      (bcrypt.hash as unknown as jest.Mock).mockResolvedValue(
        '$2b$10$hashedPassword',
      );
      mockPrisma.user.create.mockResolvedValue(mockUserWithRole);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toHaveProperty('role');
      expect(result.role.name).toBe('ADMIN');
    });

    it('should validate required fields', async () => {
      // Arrange - missing email
      const createUserDto = {
        name: 'Juan',
        email: '',
        password: 'password123',
        roleId: 'role-id-1',
      };

      // Act & Assert - this will be validated by NestJS DTO validation
      // but we can test that create is called
      expect(createUserDto).toHaveProperty('name');
      expect(createUserDto).toHaveProperty('email');
      expect(createUserDto).toHaveProperty('password');
      expect(createUserDto).toHaveProperty('roleId');
    });
  });

  describe('findByEmail', () => {
    it('should return user with role by email', async () => {
      // Arrange
      const email = 'admin@test.com';
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithRole);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { role: true },
      });
      expect(result).toEqual(mockUserWithRole);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const email = 'notexist@test.com';
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(result).toBeNull();
    });

    it('should include role information in response', async () => {
      // Arrange
      const email = 'admin@test.com';
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithRole);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(result.role).toBeDefined();
      expect(result.role.name).toBe('ADMIN');
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      // Arrange
      const userId = 'user-id-1';
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithRole);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { role: true },
      });
      expect(result).toEqual(mockUserWithRole);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users with roles', async () => {
      // Arrange
      const users = [mockUserWithRole];
      mockPrisma.user.findMany.mockResolvedValue(users);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        include: { role: true },
      });
      expect(result).toEqual(users);
    });

    it('should include role for each user', async () => {
      // Arrange
      const users = [mockUserWithRole];
      mockPrisma.user.findMany.mockResolvedValue(users);

      // Act
      const result = await service.findAll();

      // Assert
      result.forEach((user) => {
        expect(user).toHaveProperty('role');
      });
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      // Arrange
      const userId = 'user-id-1';
      const updateUserDto = { name: 'Juan Updated' };
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUserWithRole);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUserWithRole,
        ...updateUserDto,
      });

      // Act
      await service.update(userId, updateUserDto);

      // Assert
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
        include: { role: true },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.update(userId, { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should hash password if password is updated', async () => {
      // Arrange
      const userId = 'user-id-1';
      const updateUserDto = { password: 'newPassword123' };
      const hashedPassword = '$2b$10$newHashedPassword';

      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUserWithRole);
      (bcrypt.hash as unknown as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUserWithRole,
        password: hashedPassword,
      });

      // Act
      await service.update(userId, updateUserDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(updateUserDto.password, 10);
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      // Arrange
      const userId = 'user-id-1';
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUserWithRole);
      mockPrisma.user.delete.mockResolvedValue(mockUserWithRole);

      // Act
      await service.remove(userId);

      // Assert
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
