const terminal = document.querySelector("#terminal");
const output = document.querySelector("#terminal-output");
const input = document.querySelector("#terminal-input");
const buffer = document.querySelector("#command-buffer");

const STARTUP_LINES = [
  "Linux badeye 6.15.2-arch1-1 x86_64 GNU/Linux",
  "",
  "Welcome to badeye's terminal.",
  'Type "help" to view available commands.',
  "",
];

const COMMANDS = [
  "help", "about", "socials", "projects", "skills", "stats", "contact", "clear", "pwd",
  "whoami", "hostname", "uname", "ls", "cat", "echo", "date", "uptime", "neofetch",
  "tree", "history", "fortune", "exit",
];

const fortunes = [
  "There are only two hard things in Computer Science:\ncache invalidation and naming things.",
  "Programs must be written for people to read, and only incidentally for machines to execute.",
  "Talk is cheap. Show me the code.",
  "First, solve the problem. Then, write the code.",
  "The best error message is the one that never shows up.",
  "Simplicity is the soul of efficiency.",
];

let command = "";
let history = [];
let historyIndex = 0;
let acceptingInput = true;

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function scrollToBottom() {
  requestAnimationFrame(() => { terminal.scrollTop = terminal.scrollHeight; });
}

function setCommand(value) {
  command = value;
  buffer.textContent = command;
  input.value = command;
  scrollToBottom();
}

function line(html = "", className = "") {
  const div = document.createElement("div");
  div.className = `line${className ? ` ${className}` : ""}`;
  div.innerHTML = html || "&nbsp;";
  output.appendChild(div);
  scrollToBottom();
  return div;
}

function textBlock(text, className = "") {
  String(text).split("\n").forEach((part) => line(escapeHtml(part), className));
}

function promptLine(cmd) {
  line(`<span class="prompt"><span class="user">badeye@root</span><span class="punct">:</span><span class="dir">~</span><span class="punct">$</span></span> ${escapeHtml(cmd)}`);
}

async function typeLines(lines, speed = 11) {
  acceptingInput = false;
  for (const item of lines) {
    const div = line();
    div.textContent = "";
    for (const char of item) {
      div.textContent += char;
      await new Promise((resolve) => setTimeout(resolve, speed));
      scrollToBottom();
    }
  }
  acceptingInput = true;
  input.focus();
}

function startup(animated = true) {
  output.innerHTML = "";
  setCommand("");
  if (animated) typeLines(STARTUP_LINES, 9);
  else textBlock(STARTUP_LINES.join("\n"));
}

function help() {
  return `Available commands\n\n${COMMANDS.join("\n")}`;
}

function neofetch() {
  return `       /\\
      /  \\
     / /\\ \\
    / ____ \\
   /_/    \\_\\

OS: Arch Linux
Host: root
Kernel: 6.15.2
Shell: bash
Terminal: badeye-terminal
CPU: AMD Ryzen
Memory: 32GB`;
}

function execute(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;
  const [name, ...args] = trimmed.split(/\s+/);
  const rest = raw.trimStart().slice(name.length).trimStart();

  switch (name) {
    case "help": return textBlock(help());
    case "about": return textBlock("Developer.\nMinecraft enthusiast.\nBackend systems.\nWeb development.\nTerminal enjoyer.");
    case "socials": return textBlock("Discord : discord.gg/badeye\nGitHub  : github.com/augumental\nYouTube : youtube.com/@badeyereal\nWebsite : https://badeye.dev");
    case "projects": return textBlock("• MCPvP Checker\n• eyecoin.site\n• magnesium.wtf\n• Minecraft Plugins\n• Full Stack Websites");
    case "skills": return textBlock("Java\nJavaScript\nTypeScript\nHTML\nCSS\nNode.js\nLinux\nGit\nDocker\nMinecraft Development");
    case "stats": return textBlock("Projects Completed : 42\nCoffee Consumed    : ∞\nLines of Code      : 4,000,000+\nSleep              : 2 hours");
    case "contact": return textBlock("Discord:\n@bad.eye\n\nEmail:\nnone <3");
    case "pwd": return textBlock("/home/badeye");
    case "whoami": return textBlock("badeye");
    case "hostname": return textBlock("root");
    case "uname": return textBlock(args.includes("-a") ? STARTUP_LINES[0] : "Linux");
    case "ls": return textBlock("about.txt\nprojects/\nsocials/\ncontact.txt\nskills.txt\nstats.txt");
    case "tree": return textBlock(".\n├── about.txt\n├── contact.txt\n├── skills.txt\n├── socials\n│   ├── github\n│   ├── discord\n│   └── youtube\n└── projects\n    ├── blaysmp\n    ├── terminal\n    └── misc");
    case "cat": {
      if (args[0] === "about.txt") return textBlock("Developer.\nMinecraft enthusiast.\nBackend systems.\nWeb development.\nTerminal enjoyer.");
      if (["contact.txt", "skills.txt", "stats.txt"].includes(args[0])) return execute(args[0].replace(".txt", ""));
      return textBlock(args[0] ? `cat: ${args[0]}: No such file or directory` : "cat: missing file operand", "error");
    }
    case "echo": return textBlock(rest);
    case "date": return textBlock(new Date().toLocaleString(undefined, { dateStyle: "full", timeStyle: "medium" }));
    case "uptime": return textBlock("up 127 days, 14 hours, 38 minutes");
    case "neofetch": return textBlock(neofetch());
    case "history": return textBlock(history.map((entry, index) => `${String(index + 1).padStart(5)}  ${entry}`).join("\n"));
    case "fortune": return textBlock(fortunes[Math.floor(Math.random() * fortunes.length)]);
    case "clear": output.innerHTML = ""; return;
    case "exit":
      textBlock("logout\n\nConnection to localhost closed.");
      acceptingInput = false;
      setTimeout(() => { acceptingInput = true; startup(true); }, 2000);
      return;
    default: return textBlock(`bash: ${name}: command not found`, "error");
  }
}

function submitCommand() {
  const current = command;
  promptLine(current);
  if (current.trim()) {
    history.push(current);
    historyIndex = history.length;
  }
  setCommand("");
  execute(current);
}

function autocomplete() {
  const trimmed = command.trimStart();
  if (!trimmed || trimmed.includes(" ")) return;
  const matches = COMMANDS.filter((cmd) => cmd.startsWith(trimmed));
  if (matches.length === 1) setCommand(matches[0]);
  else if (matches.length > 1) textBlock(matches.join("  "));
}

input.addEventListener("keydown", (event) => {
  if (!acceptingInput && !["c", "C"].includes(event.key)) { event.preventDefault(); return; }
  if (event.ctrlKey && event.key.toLowerCase() === "l") { event.preventDefault(); output.innerHTML = ""; setCommand(""); return; }
  if (event.ctrlKey && event.key.toLowerCase() === "c") { event.preventDefault(); promptLine(`${command}^C`); setCommand(""); acceptingInput = true; return; }
  if (event.key === "Enter") { event.preventDefault(); submitCommand(); return; }
  if (event.key === "ArrowUp") { event.preventDefault(); if (history.length) setCommand(history[Math.max(0, --historyIndex)] || ""); return; }
  if (event.key === "ArrowDown") { event.preventDefault(); if (history.length) { historyIndex = Math.min(history.length, historyIndex + 1); setCommand(historyIndex === history.length ? "" : history[historyIndex]); } return; }
  if (event.key === "Tab") { event.preventDefault(); autocomplete(); }
});

input.addEventListener("input", () => setCommand(input.value.replace(/[\r\n]/g, "")));
terminal.addEventListener("pointerdown", () => input.focus());
document.addEventListener("selectionchange", () => {
  if (!document.getSelection()?.toString()) input.focus();
});

startup(true);
input.focus();
