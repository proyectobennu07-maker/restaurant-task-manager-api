import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let mockExecutionContext: Partial<ExecutionContext>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    it('should allow access when user has required role', () => {
      // Arrange
      const requiredRoles = ['ADMIN'];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { userId: 'user-1', role: 'ADMIN' },
          }),
        }),
      };

      // Act
      const result = guard.canActivate(
        mockExecutionContext as ExecutionContext,
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      // Arrange
      const requiredRoles = ['ADMIN', 'SUPERVISOR'];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { userId: 'user-1', role: 'SUPERVISOR' },
          }),
        }),
      };

      // Act
      const result = guard.canActivate(
        mockExecutionContext as ExecutionContext,
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user does not have required role', () => {
      // Arrange
      const requiredRoles = ['ADMIN'];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { userId: 'user-1', role: 'USER' },
          }),
        }),
      };

      // Act & Assert
      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow(ForbiddenException);
    });

    it('should allow access when no roles are required (public endpoint)', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { userId: 'user-1', role: 'USER' },
          }),
        }),
      };

      // Act
      const result = guard.canActivate(
        mockExecutionContext as ExecutionContext,
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when no user in request', () => {
      // Arrange
      const requiredRoles = ['ADMIN'];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: null,
          }),
        }),
      };

      // Act & Assert
      expect(() => {
        guard.canActivate(mockExecutionContext as ExecutionContext);
      }).toThrow(ForbiddenException);
    });
  });
});
