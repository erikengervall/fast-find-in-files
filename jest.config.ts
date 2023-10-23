import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  roots: ['<rootDir>/src-node'],
  projects: ['<rootDir>/src-node'],
  prettierPath: require.resolve('prettier-2'),
}

export default config
