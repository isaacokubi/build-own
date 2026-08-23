import globals from 'globals';
export default [{files:['**/*.{js,jsx}'],languageOptions:{globals:{...globals.browser,...globals.node},parserOptions:{ecmaVersion:'latest',sourceType:'module',ecmaFeatures:{jsx:true}}},rules:{'no-unused-vars':['warn',{argsIgnorePattern:'^_'}]}}];
