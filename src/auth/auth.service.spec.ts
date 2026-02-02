import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { mockPrismaService } from './mocks/prisma.mock';
import { mockUserWithRole, loginDto, mockUser } from './mocks/fixtures';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access_token when credentials are valid', async () => {
      // Arrange
      const mockToken = 'fake-jwt-token';
      (usersService.findByEmail as jest.Mock).mockResolvedValue(
        mockUserWithRole,
      );
      (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(result).toEqual({ access_token: mockToken });
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUserWithRole.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUserWithRole.id,
        role: mockUserWithRole.role.name,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      (usersService.findByEmail as jest.Mock).mockResolvedValue(
        mockUserWithRole,
      );
      (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUserWithRole.password,
      );
    });

    it('should include sub and role in JWT payload', async () => {
      // Arrange
      const mockToken = 'fake-jwt-token';
      (usersService.findByEmail as jest.Mock).mockResolvedValue(
        mockUserWithRole,
      );
      (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      await authService.login(loginDto);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUserWithRole.id,
        role: mockUserWithRole.role.name,
      });
    });

    it('should call bcrypt.compare with correct parameters', async () => {
      // Arrange
      const mockToken = 'fake-jwt-token';
      (usersService.findByEmail as jest.Mock).mockResolvedValue(
        mockUserWithRole,
      );
      (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      await authService.login(loginDto);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUserWithRole.password,
      );
    });
  });
});
