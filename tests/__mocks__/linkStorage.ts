export const linkStorage = {
  save: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockResolvedValue([]),
  remove: jest.fn().mockResolvedValue(undefined),
};
