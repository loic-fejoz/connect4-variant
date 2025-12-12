import js from "@eslint/js";
import security from "eslint-plugin-security";
import globals from "globals";

export default [
    js.configs.recommended,
    security.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off",
            "security/detect-object-injection": "off"
        }
    }
];
