import globals from 'globals';

export default [{
  ignores:['dist/**','node_modules/**'],
  files:['**/*.{js,jsx}'],
  languageOptions:{globals:{...globals.browser,...globals.node},parserOptions:{ecmaVersion:'latest',sourceType:'module',ecmaFeatures:{jsx:true}}},
  rules:{'no-unused-vars':['warn',{argsIgnorePattern:'^_'}]}
}];
