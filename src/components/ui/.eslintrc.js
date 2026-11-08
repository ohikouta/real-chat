module.exports = {
  env: {
    'vue/setup-compiler-macros': true
  },
  rules: {
    'vue/multi-word-component-names': ['error', {
      ignores: ['Button', 'Input', 'Label']
    }]
  }
};
