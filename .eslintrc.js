// Existing code has ~150 console.* call sites scattered across both the parent
// repo and the structures submodule. We ratchet here rather than migrating in
// one shot: `warn` surfaces every existing call as a lint signal but keeps
// builds green; PR reviewers can ask for `client.log(...)` on any new offender
// without merging the file. CLI scripts under src/scripts/ legitimately log to
// stdout, so we allow `console` there.
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    env: {
        node: true,
    },
    plugins: ["@typescript-eslint"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    rules: {
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/ban-ts-comment": "error",
        "@typescript-eslint/no-empty-function": "off",
        "no-mixed-spaces-and-tabs": ["warn", "smart-tabs"],
        "no-empty": "off",
        "no-console": ["warn", { allow: ["warn", "error"] }],
        semi: "error",
    },
    overrides: [
        {
            files: ["src/scripts/**/*.ts"],
            rules: {
                "no-console": "off",
            },
        },
    ],
};
