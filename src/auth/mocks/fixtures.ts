export const mockRole = {
  id: 'role-uuid-1',
  name: 'ADMIN',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockUser = {
  id: 'user-uuid-1',
  name: 'Juan Admin',
  email: 'admin@test.com',
  password: 'hashedPassword123',
  roleId: 'role-uuid-1',
  createdAt: new Date(),
};

export const mockUserWithRole = {
  ...mockUser,
  role: mockRole,
};

export const loginDto = {
  email: 'admin@test.com',
  password: 'password123',
};

export const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const mockJwtPayload = {
  sub: 'user-uuid-1',
  role: 'ADMIN',
  exp: Math.floor(Date.now() / 1000) + 3600,
};
