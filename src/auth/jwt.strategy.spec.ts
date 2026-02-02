import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { mockJwtPayload } from './mocks/fixtures';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key';
    strategy = new JwtStrategy();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('constructor', () => {
    it('should throw UnauthorizedException if JWT_SECRET is not defined', () => {
      // Arrange
      delete process.env.JWT_SECRET;

      // Act & Assert
      expect(() => {
        new JwtStrategy();
      }).toThrow(UnauthorizedException);
    });

    it('should initialize with JWT_SECRET from environment', () => {
      // Arrange
      process.env.JWT_SECRET = 'test-secret';

      // Act & Assert
      expect(() => {
        new JwtStrategy();
      }).not.toThrow();
    });
  });

  describe('validate', () => {
    it('should return payload with sub and role when token is valid', () => {
      // Arrange
      const payload = {
        sub: 'user-id-123',
        role: 'ADMIN',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        sub: 'user-id-123',
        role: 'ADMIN',
      });
    });

    it('should throw UnauthorizedException if payload has no sub', () => {
      // Arrange
      const payload = {
        role: 'ADMIN',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      // Act & Assert
      expect(() => {
        strategy.validate(payload);
      }).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if payload has no role', () => {
      // Arrange
      const payload = {
        sub: 'user-id-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      // Act & Assert
      expect(() => {
        strategy.validate(payload);
      }).toThrow(UnauthorizedException);
    });

    it('should extract sub and role correctly from payload', () => {
      // Arrange
      const payload = {
        sub: 'user-123',
        role: 'SUPERVISOR',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      // Act
      const result = strategy.validate(payload);

      // Assert
      expect(result.sub).toBe('user-123');
      expect(result.role).toBe('SUPERVISOR');
    });
  });
});
