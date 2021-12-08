const _print = function (message) {
  console.log(`[${(new Date()).toISOString()}] ${message}`);
};

const _print_inline = function (message) {
  _print(message);
};

const _print_bold = function (message) {
  _print(`**${message}**`);
};

export {
  _print,
  _print_inline,
  _print_bold,
}
