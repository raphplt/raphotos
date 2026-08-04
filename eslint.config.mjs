import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescriptConfig from "eslint-config-next/typescript";

/**
 * eslint-config-next 16 expose directement des configurations « flat » :
 * aucune couche de compatibilité (@eslint/eslintrc) n'est nécessaire.
 */
const eslintConfig = [
	{
		ignores: [".next/**", "node_modules/**", "next-env.d.ts", "supabase/**"],
	},
	...coreWebVitals,
	...typescriptConfig,
	{
		rules: {
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],
		},
	},
];

export default eslintConfig;
