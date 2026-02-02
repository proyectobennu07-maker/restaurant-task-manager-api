import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { loginDto } from './mocks/fixtures';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      // Arrange
      const mockToken = 'fake-jwt-token';
      mockAuthService.login.mockResolvedValue({ access_token: mockToken });

      // Act
      await authController.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should return access_token when credentials are valid', async () => {
      // Arrange
      const mockToken = 'fake-jwt-token';
      const expectedResult = { access_token: mockToken };
      mockAuthService.login.mockResolvedValue(expectedResult);

      // Act
      const result = await authController.login(loginDto);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should propagate UnauthorizedException from service', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Credenciales inválidas'),
      );

      // Act & Assert
      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should validate LoginDto parameters', async () => {
      // Arrange
      const mockToken = 'fake-jwt-token';
      mockAuthService.login.mockResolvedValue({ access_token: mockToken });
      const validLoginDto = { email: 'test@test.com', password: 'password123' };

      // Act
      await authController.login(validLoginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
    });
  });
});
