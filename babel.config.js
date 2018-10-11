module.exports = {
  plugins: [
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-proposal-class-properties"
  ],
  presets: ["@babel/preset-env"],
  ignore: [__dirname + "/node_modules"]
};
