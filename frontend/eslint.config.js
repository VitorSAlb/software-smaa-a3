const globals = require("globals");
const pluginJs = require("@eslint/js");
const pluginReactConfig = require("eslint-plugin-react/configs/recommended.js");

module.exports = {
  languageOptions: {
    globals: {
      myGlobalVariable: true
    }
  },
  plugins: ["@eslint/js", "react", "prettier"], // Adiciona os plugins utilizados
  overrides: [
    {
      files: ["*.js", "*.jsx"], // Especifica os arquivos a serem analisados por essas regras
      extends: ["plugin:@eslint/js/recommended", "plugin:react/recommended"],
      rules: {
        // Adicione quaisquer regras específicas do ESLint aqui, se necessário
      }
    },
    {
      files: ["*.js", "*.jsx"], // Especifica os arquivos a serem analisados por essas regras
      extends: ["plugin:prettier/recommended"],
      rules: {
        // Adicione quaisquer regras específicas do Prettier aqui, se necessário
      }
    }
  ]
};
