import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockRole } from '../auth/mocks/fixtures';

describe('RolesService', () => {
  let service: RolesService;
  let prismaService: PrismaService;

  const mockPrisma = {
    role: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create role with valid name', async () => {
      // Arrange
      const createRoleDto = { name: 'ADMIN' };
      mockPrisma.role.create.mockResolvedValue(mockRole);

      // Act
      const result = await service.create(createRoleDto);

      // Assert
      expect(mockPrisma.role.create).toHaveBeenCalledWith({
        data: { name: createRoleDto.name },
      });
      expect(result).toEqual(mockRole);
    });

    it('should return role with id and name', async () => {
      // Arrange
      const createRoleDto = { name: 'SUPERVISOR' };
      const createdRole = {
        id: 'role-uuid-2',
        name: 'SUPERVISOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.role.create.mockResolvedValue(createdRole);

      // Act
      const result = await service.create(createRoleDto);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result.name).toBe('SUPERVISOR');
    });
  });

  describe('findOne', () => {
    it('should return role by id', async () => {
      // Arrange
      const roleId = 'role-uuid-1';
      mockPrisma.role.findUnique.mockResolvedValue(mockRole);

      // Act
      const result = await service.findOne(roleId);

      // Assert
      expect(mockPrisma.role.findUnique).toHaveBeenCalledWith({
        where: { id: roleId },
      });
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException when role not found', async () => {
      // Arrange
      const roleId = 'non-existent-id';
      mockPrisma.role.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(roleId)).rejects.toThrow(NotFoundException);
    });

    it('should throw error message with correct format', async () => {
      // Arrange
      const roleId = 'non-existent-id';
      mockPrisma.role.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(roleId)).rejects.toThrow(
        `Role with id ${roleId} not found`,
      );
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      // Arrange
      const roles = [mockRole];
      mockPrisma.role.findMany.mockResolvedValue(roles);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockPrisma.role.findMany).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });

    it('should return empty array when no roles exist', async () => {
      // Arrange
      mockPrisma.role.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return multiple roles', async () => {
      // Arrange
      const roles = [
        mockRole,
        {
          id: 'role-uuid-2',
          name: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrisma.role.findMany.mockResolvedValue(roles);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toEqual(roles);
    });
  });

  describe('remove', () => {
    it('should delete role by id', async () => {
      // Arrange
      const roleId = 'role-uuid-1';
      mockPrisma.role.findUnique.mockResolvedValueOnce(mockRole);
      mockPrisma.role.delete.mockResolvedValue(mockRole);

      // Act
      await service.remove(roleId);

      // Assert
      expect(mockPrisma.role.delete).toHaveBeenCalledWith({
        where: { id: roleId },
      });
    });

    it('should throw NotFoundException if role not found', async () => {
      // Arrange
      const roleId = 'non-existent-id';
      mockPrisma.role.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.remove(roleId)).rejects.toThrow(NotFoundException);
    });

    it('should return deleted role', async () => {
      // Arrange
      const roleId = 'role-uuid-1';
      mockPrisma.role.findUnique.mockResolvedValueOnce(mockRole);
      mockPrisma.role.delete.mockResolvedValue(mockRole);

      // Act
      const result = await service.remove(roleId);

      // Assert
      expect(result).toEqual(mockRole);
    });
  });
});
