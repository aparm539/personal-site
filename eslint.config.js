import antfu from '@antfu/eslint-config'

export default antfu({ nextjs: true, rules: {
  'unicorn/prefer-node-protocol': 'off',
} })
