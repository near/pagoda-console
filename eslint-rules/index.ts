import * as requiredProperties from "./required-properties";

module.exports = {
  rules: {
    [requiredProperties.name]: requiredProperties.rule,
  },
};
