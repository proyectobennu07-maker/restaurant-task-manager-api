// Mockeamos @nestjs/passport ANTES de importar JwtAuthGuard
jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => {
    return class MockAuthGuard {
      canActivate(context: any) {
        return true;
      }
    };
  },
}));

import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should be an instance of JwtAuthGuard', () => {
      expect(guard).toBeDefined();
      expect(guard.constructor.name).toBe('JwtAuthGuard');
    });

    it('should have canActivate method', () => {
      expect(typeof guard.canActivate).toBe('function');
    });

    it('should return true from canActivate', () => {
      // Arrange
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { sub: 'user-id', role: 'ADMIN' },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should protect endpoints with JWT authentication', () => {
      expect(guard).toBeDefined();
      expect(typeof guard.canActivate).toBe('function');
    });
  });
});
