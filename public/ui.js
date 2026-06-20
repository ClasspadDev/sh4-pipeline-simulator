// ===============================================================
// SH4 Pipeline Simulator — UI logic & Syntax Highlights
// ===============================================================

const ABSTRACT_HINTS = {
    "bf": "If T==0 then branch to PC+4+(disp*2).",
    "bf/s": "If T==0 then delayed branch to PC+4+(disp*2).",
    "bt": "If T==1 then branch to PC+4+(disp*2).",
    "bt/s": "If T==1 then delayed branch to PC+4+(disp*2).",
    "bra": "Unconditional branch to PC+4+(disp*2).",
    "braf": "Unconditional branch via register offset (PC+4+Rm).",
    "bsr": "Branch to subroutine; PR <- return address.",
    "bsrf": "Branch to subroutine via register offset; PR <- return address.",
    "jmp": "Jump to target register address.",
    "jsr": "Jump to subroutine register target; PR <- return address.",
    "rts": "Return from subroutine; PC <- PR.",
    "rte": "Return from exception; restores control state and PC.",
    "mov": "Moves a value between general registers.",
    "mov.b": "Moves one byte between register/memory forms.",
    "mov.w": "Moves one word between register/memory forms.",
    "mov.l": "Moves one longword between register/memory forms.",
    "mova": "Computes PC-relative address into R0.",
    "movt": "Copies T bit into a general register.",
    "add": "Adds Rm to Rn and stores result in Rn.",
    "addc": "Adds with carry using T as carry-in/out.",
    "addv": "Adds with signed overflow detection (T reflects overflow).",
    "sub": "Subtracts Rm from Rn and stores result in Rn.",
    "subc": "Subtracts with borrow using T as borrow-in/out.",
    "subv": "Subtracts with signed overflow detection (T reflects overflow).",
    "cmp/eq": "Compares equality and updates T.",
    "cmp/hs": "Unsigned >= compare, updates T.",
    "cmp/ge": "Signed >= compare, updates T.",
    "cmp/hi": "Unsigned > compare, updates T.",
    "cmp/gt": "Signed > compare, updates T.",
    "cmp/pz": "Compares Rn >= 0, updates T.",
    "cmp/pl": "Compares Rn > 0, updates T.",
    "cmp/str": "Byte-wise string compare between registers, updates T.",
    "and": "Bitwise AND.",
    "or": "Bitwise OR.",
    "xor": "Bitwise XOR.",
    "not": "Bitwise NOT.",
    "tst": "Bitwise test, updates T.",
    "tas.b": "Test-and-set byte; updates T and sets high bit in memory byte.",
    "shll": "Logical shift left by 1.",
    "shlr": "Logical shift right by 1.",
    "shal": "Arithmetic shift left by 1.",
    "shar": "Arithmetic shift right by 1.",
    "rotl": "Rotate left through register.",
    "rotr": "Rotate right through register.",
    "rotcl": "Rotate left through carry (T).",
    "rotcr": "Rotate right through carry (T).",
    "div0u": "Initializes unsigned divide step state.",
    "div0s": "Initializes signed divide step state.",
    "div1": "Performs one iterative divide step.",
    "mul.l": "32-bit multiply, low result path.",
    "muls.w": "Signed 16x16 multiply.",
    "mulu.w": "Unsigned 16x16 multiply.",
    "mac.l": "Multiply-accumulate longword.",
    "mac.w": "Multiply-accumulate word.",
    "dt": "Decrement and test (updates T when result is zero).",
    "exts.b": "Sign-extends byte to 32-bit.",
    "exts.w": "Sign-extends word to 32-bit.",
    "extu.b": "Zero-extends byte to 32-bit.",
    "extu.w": "Zero-extends word to 32-bit.",
    "stc": "Stores control register to general register/memory form.",
    "stc.l": "Stores control register longword with memory form.",
    "lds": "Loads system register from general register.",
    "lds.l": "Loads system register longword from memory form.",
    "ldc": "Loads control register from general register.",
    "ldc.l": "Loads control register longword from memory form.",
    "ldtlb": "Loads TLB entry using MMU state.",
    "trapa": "Software trap/exception instruction.",
    "sleep": "Enters low-power sleep until interrupt/exception.",
    "nop": "No operation.",
    "pref": "Prefetch hint.",
    "clrt": "Clears T bit.",
    "sett": "Sets T bit.",
    "clrs": "Clears S bit.",
    "sets": "Sets S bit.",
    "clrmac": "Clears MAC registers.",
    "movli.l": "Load-linked style move longword.",
    "movco.l": "Conditional store longword variant.",
    "movca.l": "Cache line move/store assist.",
    "ocbi": "Operand cache block invalidate.",
    "ocbp": "Operand cache block purge.",
    "ocbwb": "Operand cache block write-back.",
    "prefi": "Instruction prefetch hint.",
    "icbi": "Instruction cache block invalidate.",
    "synco": "Synchronization barrier.",
    "setrc": "Set RC control/register context.",
    "ldrc": "Load RC control/register context.",
    "movua.l": "Unaligned longword move variant.",
    "ldrs": "Load status/control extension.",
    "ldre": "Load resource/register extension."
};

const SIM_JS_OPCODES = ['mov','mova','movt','exts','extu','swap','xtrct','add','addc','addv','cmp','div0s','div0u','div1','dmuls','dmulu','mul','muls','mulu','mac','neg','negc','sub','subc','subv','and','or','xor','not','tst','tas','rotcl','rotcr','rotl','rotr','shad','shal','shar','shld','shll','shll2','shll8','shll16','shlr','shlr2','shlr8','shlr16','bf','bt','bra','braf','bsr','bsrf','jmp','jsr','rts','rte','sleep','trapa','ldtlb','ldc','lds','stc','sts','nop','clrs','clrt','sets','sett','clrmac','pref','ocbi','ocbp','ocbwb','movca','fldi0','fldi1','fmov','flds','fsts','fabs','fadd','fcmp','fdiv','float','fmac','fmul','fneg','fsqrt','fsub','ftrc','fcnvds','fcnvsd','fipr','ftrv','fsrra','fsca','frchg','fschg'];
const CPU73050_OPCODES = ["add","addc","addv","and","and.b","bf","bf/s","bra","braf","bsr","bsrf","bt","bt/s","clrdmxy","clrmac","clrs","clrt","cmp/eq","cmp/ge","cmp/gt","cmp/hi","cmp/hs","cmp/pl","cmp/pz","cmp/str","div0s","div0u","div1","dmuls.l","dmulu.l","dsp","dt","exts.b","exts.w","extu.b","extu.w","icbi","jmp","jsr","ldc","ldc.l","ldrc","ldre","ldrs","lds","lds.l","ldtlb","mac.l","mac.w","mov","mov.b","mov.l","mov.w","mova","movca.l","movco.l","movli.l","movt","movua.l","mul.l","muls.w","mulu.w","neg","negc","nop","not","ocbi","ocbp","ocbwb","or","or.b","pref","prefi","rotcl","rotcr","rotl","rotr","rte","rts","setdmx","setdmy","setrc","sets","sett","shad","shal","shar","shld","shll","shll16","shll2","shll8","shlr","shlr16","shlr2","shlr8","sleep","stc","stc.l","sts","sts.l","sub","subc","subv","swap.b","swap.w","synco","tas.b","trapa","tst","tst.b","xor","xor.b","xtrct"];

const ALL_OPCODES = Array.from(new Set([...SIM_JS_OPCODES, ...CPU73050_OPCODES]));
const BASE_OPCODES = ALL_OPCODES.map(op => op.split(/[\.\/]/)[0]);

const SH4_EXAMPLE = `; SH4 Pipeline Simulator - Example
; Edit this code and click the "Sim" icon in the sidebar
; to view the generated pipeline diagram.
; Comments: ; ! //
; # at the start of a line = section title, ## = subtitle

# Arithmetic and moves
mov #5, r0
mov #10, r1
add r0, r1
mov r1, r2

# Memory load
mov.l @r1, r3
mov r3, r4
nop

# Loop with branch
## Countdown loop
mov #3, r5
loop:
cmp/eq r5, r0
bt done
add #-1, r5
bra loop
nop
done:
rts
nop
`;

let editor = null;
let currentTheme = 'hollyhock';
let lastSimContent = null;
let debounceTimer = null;
let focusSimActionDisposable = null;

// ---------------------------------------------------------------
// SH4 Assembly language definition for Monaco
// ---------------------------------------------------------------
function defineSh4Language() {
  monaco.languages.register({ id: 'sh4asm' });

  monaco.languages.setMonarchTokensProvider('sh4asm', {
    defaultToken: '',
    tokenPostfix: '.sh4asm',
    ignoreCase: true,
    instructions: BASE_OPCODES,
    registers: [
      'r0','r1','r2','r3','r4','r5','r6','r7',
      'r8','r9','r10','r11','r12','r13','r14','r15',
      'fr0','fr1','fr2','fr3','fr4','fr5','fr6','fr7',
      'fr8','fr9','fr10','fr11','fr12','fr13','fr14','fr15',
      'dr0','dr2','dr4','dr6','dr8','dr10','dr12','dr14',
      'xd0','xd2','xd4','xd6','xd8','xd10','xd12','xd14',
      'fv0','fv4','fv8','fv12',
      'xf0','xf1','xf2','xf3','xf4','xf5','xf6','xf7',
      'xf8','xf9','xf10','xf11','xf12','xf13','xf14','xf15',
      'r0_bank','r1_bank','r2_bank','r3_bank',
      'r4_bank','r5_bank','r6_bank','r7_bank',
      'rm','rn','frm','frn','drm','drn','xdm','xdn','fvm','fvn',
      'rm_bank','rn_bank'
    ],
    specialRegs: ['pc','gbr','vbr','sgr','spc','ssr','dbr',
                  'mach','macl','pr','fpul','fpscr','sr','xmtrx'],
    tokenizer: {
      root: [
        [/\/\/.*$/, 'comment'],
        [/;.*$/, 'comment'],
        [/!.*$/, 'comment'],
        [/^#+.*$/, 'keyword.section'],
        [/^[A-Za-z_][A-Za-z0-9_]*:/, 'tag'],
        [/^\.[a-zA-Z]+/, 'keyword.directive'],
        [/#/, 'operator'],
        [/[A-Za-z_][A-Za-z0-9_]*/, {
          cases: {
            '@instructions': 'keyword',
            '@registers':    'variable',
            '@specialRegs':  'variable.predefined',
            '@default':      'identifier'
          }
        }],
        [/\.[A-Za-z0-9]+/, 'keyword'],
        [/\/[A-Za-z0-9]+/, 'keyword'],
        [/-?0x[0-9a-fA-F]+/, 'number.hex'],
        [/-?\d+/, 'number'],
        [/[(),]/, 'delimiter'],
        [/@/, 'operator'],
        [/[+\-]/, 'operator'],
        [/\s+/, 'white'],
      ]
    }
  });

  monaco.languages.setLanguageConfiguration('sh4asm', {
    comments: { lineComment: ';' },
    brackets: [['(', ')']],
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  });

  // Autocomplete Provider
  monaco.languages.registerCompletionItemProvider('sh4asm', {
    provideCompletionItems: function(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };
      
      const suggestions = ALL_OPCODES.map(op => {
        return {
          label: op,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: op,
          detail: ABSTRACT_HINTS[op] || ABSTRACT_HINTS[op.split(/[\.\/]/)[0]] || 'SH4 Instruction',
          range: range
        };
      });
      return { suggestions: suggestions };
    }
  });

  // Hover Provider for Hints (Instructions & Operands)
  monaco.languages.registerHoverProvider('sh4asm', {
    provideHover: function(model, position) {
      const word = model.getWordAtPosition(position);
      if (!word) return null;
      
      const line = model.getLineContent(position.lineNumber);
      const wordText = word.word;
      
      // Operand Hover Hints
      let operandHint = null;
      const before = line.substring(Math.max(0, word.startColumn - 2), word.startColumn - 1);
      const after = line.substring(word.endColumn - 1, word.endColumn);

      // Pointer logic @Rn, @Rn+, @-Rn
      if (before === '@' && wordText.match(/^r(\d+)$/i)) {
        const regNum = wordText.match(/^r(\d+)$/i)[1];
        operandHint = `Memory address pointed to by Register ${regNum}`;
        if (after === '+') operandHint += ' (post-increment)';
      } 
      // Immediate value #imm
      else if ((wordText.match(/^\d+$/) || wordText.match(/^0x[0-9a-fA-F]+$/)) && before === '#') {
        operandHint = `Immediate constant: \`#${wordText}\``;
      }
      // Registers
      else {
        const regMatch = wordText.match(/^(r|fr|dr|xd|fv|xf)(\d+)(_bank)?$/i);
        if (regMatch) {
          const type = regMatch[1].toLowerCase();
          const num = regMatch[2];
          const isBank = regMatch[3];
          let desc = "Register";
          if (type === 'r') desc = `General Purpose Register ${num}`;
          else if (type === 'fr') desc = `Floating Point Register ${num}`;
          else if (type === 'dr') desc = `Double Precision Register ${num}`;
          else if (type === 'xd') desc = `Extended Double Register ${num}`;
          else if (type === 'fv') desc = `Floating Point Vector ${num}`;
          else if (type === 'xf') desc = `Extended Floating Point Register ${num}`;
          if (isBank) desc += ` (Banked)`;
          operandHint = desc;
        }
      }

      if (operandHint) {
        return {
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
          contents: [
            { value: `**\`${wordText}\`**` },
            { value: operandHint }
          ]
        };
      }

      // Fallback to Instruction Hints
      const afterWord = line.substring(word.startColumn - 1);
      
      const match = afterWord.toLowerCase().match(/^([a-z]+(?:\.[blsw])?(?:\/[a-z]+)?)/);
      if (!match) return null;
      
      const fullMnemonic = match[1];
      const baseMnemonic = fullMnemonic.split(/[\.\/]/)[0];
      
      const hint = ABSTRACT_HINTS[fullMnemonic] || ABSTRACT_HINTS[baseMnemonic];
      
      if (hint) {
        return {
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.startColumn + fullMnemonic.length),
          contents: [
            { value: `**\`${fullMnemonic.toUpperCase()}\`**` },
            { value: hint }
          ]
        };
      }
      return null;
    }
  });

  // Custom Themes
  monaco.editor.defineTheme('sh4-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword.section',     foreground: 'a31515', fontStyle: 'bold italic' },
      { token: 'keyword.directive',   foreground: 'a31515' },
      { token: 'keyword',             foreground: '0000ff' },
      { token: 'variable.predefined', foreground: '267f99' },
      { token: 'variable',            foreground: '001080' },
      { token: 'number.hex',          foreground: '098658' },
      { token: 'number',              foreground: '098658' },
      { token: 'tag',                 foreground: 'ff0000' },
      { token: 'operator',            foreground: '0000ff' },
      { token: 'delimiter',           foreground: '000000' },
    ],
    colors: {}
  });

  monaco.editor.defineTheme('sh4-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword.section',     foreground: 'c586c0', fontStyle: 'bold italic' },
      { token: 'keyword.directive',   foreground: 'c586c0' },
      { token: 'keyword',             foreground: '569cd6' },
      { token: 'variable.predefined', foreground: '4ec9b0' },
      { token: 'variable',            foreground: '9cdcfe' },
      { token: 'number.hex',          foreground: 'b5cea8' },
      { token: 'number',              foreground: 'b5cea8' },
      { token: 'tag',                 foreground: 'f44747' },
      { token: 'operator',            foreground: 'd4d4d4' },
      { token: 'delimiter',           foreground: 'd4d4d4' },
    ],
    colors: {}
  });

  monaco.editor.defineTheme('sh4-hollyhock', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'a1a1aa', background: '1f2325' },
      { token: 'keyword.section',     foreground: '58615c', fontStyle: 'bold italic' },
      { token: 'keyword.directive',   foreground: '00dc68' },
      { token: 'keyword',             foreground: '2bfd87' },
      { token: 'variable.predefined', foreground: '4ec9b0' },
      { token: 'variable',            foreground: '9cdcfe' },
      { token: 'number.hex',          foreground: 'b5cea8' },
      { token: 'number',              foreground: 'b5cea8' },
      { token: 'tag',                 foreground: 'f44747' },
      { token: 'operator',            foreground: 'd4d4d4' },
      { token: 'delimiter',           foreground: 'd4d4d4' },
    ],
    colors: {
      'editor.background': '#1f2325',
      'editor.foreground': '#a1a1aa',
      'editorLineNumber.foreground': '#5a5a5a',
      'editor.selectionBackground': '#264f78',
      'editor.lineHighlightBackground': '#2a2a2a',
      'editorCursor.foreground': '#00dc68',
    }
  });
}

// ---------------------------------------------------------------
// Monaco initialization
// ---------------------------------------------------------------
function initMonaco() {
  defineSh4Language();

  const textarea = document.querySelector('.src');
  const initialValue = textarea.value || SH4_EXAMPLE;

  editor = monaco.editor.create(document.getElementById('monaco-container'), {
    value: initialValue,
    language: 'sh4asm',
    theme: 'sh4-' + currentTheme,
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    fontFamily: 'Consolas, "Courier New", monospace',
    tabSize: 4,
    lineNumbers: 'on',
    wordWrap: 'on',
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    renderWhitespace: 'selection'
  });

  editor.onDidChangeModelContent(() => {
    textarea.value = editor.getValue();
    scheduleAutoUpdate();
  });
  
  editor.onDidChangeCursorSelection(() => {
    // Don't auto-teleport on simple cursor moves to avoid annoyance
  });

  textarea.value = editor.getValue();
  updateMonacoContextAction();
}

// ---------------------------------------------------------------
// View switching & Sim refresh logic
// ---------------------------------------------------------------
function forceRefresh() {
  clearTimeout(debounceTimer);
  document.querySelector('.src').value = editor.getValue();
  do_sim();
  lastSimContent = editor.getValue();
  teleportToSelection();
  if (document.body.classList.contains('error')) {
    showToast('Error: could not assemble the code');
  } else {
    showToast('Pipeline generated');
  }
}

function scheduleAutoUpdate() {
  const autoUpdateChecked = document.getElementById('auto-update').checked;
  const isSplitMode = document.querySelector('.main-content').classList.contains('mode-split');
  if (!autoUpdateChecked || !isSplitMode) return;
  
  clearTimeout(debounceTimer);
//   showToast('Auto-update in 5s...');
  debounceTimer = setTimeout(() => {
    forceRefresh();
  }, 5000);
}

function switchView(view) {
  const mainContent = document.querySelector('.main-content');
  mainContent.classList.remove('view-code-active', 'view-sim-active', 'view-settings-active');
  mainContent.classList.add('view-' + view + '-active');
  
  const splitViewCheckbox = document.getElementById('split-view');
  if (splitViewCheckbox.checked && view !== 'settings') {
    mainContent.classList.add('mode-split');
  } else {
    mainContent.classList.remove('mode-split');
  }
  
  updateMonacoContextAction();
  updateExportMarkdownVisibility();

  document.querySelectorAll('.sidebar-btn[data-view]').forEach(b => b.classList.remove('active'));
  const activeBtns = document.querySelectorAll(`.sidebar-btn[data-view="${view}"]`);
  activeBtns.forEach(btn => btn.classList.add('active'));

  if (view === 'sim') {
    forceRefresh();
  } else if (view === 'code') {
    if (editor) requestAnimationFrame(() => editor.layout());
  }
}

function updateMonacoContextAction() {
  if (!editor) return;
  const isSplit = document.querySelector('.main-content').classList.contains('mode-split');
  if (isSplit && !focusSimActionDisposable) {
    focusSimActionDisposable = editor.addAction({
      id: 'focus-in-simulator',
      label: 'Focus in Simulator',
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: function(ed) {
        teleportToLine(ed.getPosition().lineNumber);
      }
    });
  } else if (!isSplit && focusSimActionDisposable) {
    focusSimActionDisposable.dispose();
    focusSimActionDisposable = null;
  }
}

function updateExportMarkdownVisibility() {
  const mainContent = document.querySelector('.main-content');
  const isSplit = mainContent.classList.contains('mode-split');
  const isSimActive = mainContent.classList.contains('view-sim-active');
  const mdBtn = document.getElementById('export-md-btn');
  if (mdBtn) {
    mdBtn.style.display = (isSplit || isSimActive) ? 'flex' : 'none';
  }
}

// ---------------------------------------------------------------
// Teleport Selection
// ---------------------------------------------------------------
function getPCForLine(lineNumber) {
  const lines = editor.getValue().split('\n');
  let pc = 0;
  for (let i = 0; i < lineNumber - 1 && i < lines.length; i++) {
    let no_comments = lines[i].split(/(;|!|\/\/)/)[0].replace("\t", " ").trim();
    if (no_comments.length > 0) {
      let processed = no_comments.replace(/\s+/g, " ").replace(/\s*,\s*/g, ",").replace(/@\s*/g, "@").replace(/\s*\(\s*/g, "(").replace(/\s*\)\s*/g, ")").toLowerCase().trim();
      if (processed[0] === '#' || processed[0] === '.') continue;
      if (processed[processed.length - 1] === ':') continue;
      pc += 2;
    }
  }
  return pc;
}

function teleportToLine(lineNumber) {
  const pc = getPCForLine(lineNumber);
  const target = document.querySelector(`#view-sim .row-insn-${pc}.start`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function teleportToSelection() {
  const selection = editor.getSelection();
  if (!selection) return;
  teleportToLine(selection.startLineNumber);
}

// ---------------------------------------------------------------
// Export to Markdown
// ---------------------------------------------------------------
function exportToMarkdown() {
  let md = '';
  const results = document.querySelector('.results');
  if (!results) return;

  const children = results.children;
  for (let child of children) {
    if (child.tagName === 'H2' || child.tagName === 'H3') {
      md += `\n### ${child.textContent.replace(/🔗|Copied!/g, '').trim()}\n\n`;
    } else if (child.classList.contains('result-outer')) {
      const tables = child.querySelectorAll('table');
      const rowsData = [];
      
      tables.forEach(table => {
        table.querySelectorAll('tr').forEach((tr, rowIndex) => {
          if (!rowsData[rowIndex]) rowsData[rowIndex] = [];
          tr.querySelectorAll('td').forEach(td => {
            if (!td.classList.contains('screen-hidden')) {
              let text = td.textContent.trim();
              if (text.length === 0) text = ' ';
              if (td.classList.contains('lock')) text = `[${text}]`;
              if (td.classList.contains('stall')) text = `!${text}!`;
              if (td.classList.contains('full')) text = `*${text}*`;
              rowsData[rowIndex].push(text);
            }
          });
        });
      });

      if (rowsData.length > 0) {
        const header = rowsData[0];
        md += `| ${header.join(' | ')} |\n`;
        md += `|${header.map(() => '---').join('|')}|\n`;
        for (let i = 1; i < rowsData.length; i++) {
          md += `| ${rowsData[i].join(' | ')} |\n`;
        }
        md += '\n';
      }
    }
  }

  const blob = new Blob([md], { type: 'markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'simulation.md';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Markdown exported');
}

// ---------------------------------------------------------------
// Settings persistence
// ---------------------------------------------------------------
const SETTINGS_KEYS = {
  hideCrosshairs: 'sh4_hideCrosshairs',
  plainFormat:    'sh4_plainFormat',
  lessBorders:    'sh4_lessBorders',
  splitView:      'sh4_splitView',
  autoUpdate:     'sh4_autoUpdate',
  theme:          'sh4_theme'
};

function loadSettings() {
  return {
    hideCrosshairs: localStorage.getItem(SETTINGS_KEYS.hideCrosshairs) === 'true',
    plainFormat:    localStorage.getItem(SETTINGS_KEYS.plainFormat)    === 'true',
    lessBorders:    localStorage.getItem(SETTINGS_KEYS.lessBorders)    === 'true',
    splitView:      localStorage.getItem(SETTINGS_KEYS.splitView)      === 'true',
    autoUpdate:     localStorage.getItem(SETTINGS_KEYS.autoUpdate)     === 'true',
    theme:          localStorage.getItem(SETTINGS_KEYS.theme) || 'hollyhock'
  };
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEYS.hideCrosshairs, s.hideCrosshairs);
  localStorage.setItem(SETTINGS_KEYS.plainFormat,    s.plainFormat);
  localStorage.setItem(SETTINGS_KEYS.lessBorders,    s.lessBorders);
  localStorage.setItem(SETTINGS_KEYS.splitView,      s.splitView);
  localStorage.setItem(SETTINGS_KEYS.autoUpdate,     s.autoUpdate);
  localStorage.setItem(SETTINGS_KEYS.theme,          s.theme);
}

function applySettings() {
  const s = loadSettings();
  document.getElementById('hide-crosshairs').checked = s.hideCrosshairs;
  document.getElementById('plain-format').checked    = s.plainFormat;
  document.getElementById('less-borders').checked    = s.lessBorders;
  document.getElementById('split-view').checked      = s.splitView;
  document.getElementById('auto-update').checked     = s.autoUpdate;
  
  document.querySelectorAll('input[name="theme"]').forEach(r => {
    r.checked = (r.value === s.theme);
  });

  applyTheme(s.theme);
  
  document.body.classList.toggle('plain-format', s.plainFormat);
  document.body.classList.toggle('less-borders', s.lessBorders);
  
  const mainContent = document.querySelector('.main-content');
  if (s.splitView) mainContent.classList.add('mode-split');
  else mainContent.classList.remove('mode-split');
  
  updateExportMarkdownVisibility();
}

function applyTheme(theme) {
  document.body.classList.remove('theme-light', 'theme-dark', 'theme-hollyhock');
  document.body.classList.add('theme-' + theme);
  currentTheme = theme;
  if (editor) monaco.editor.setTheme('sh4-' + theme);
}

function setupSettings() {
  const hideCrosshairs = document.getElementById('hide-crosshairs');
  const plainFormat    = document.getElementById('plain-format');
  const lessBorders    = document.getElementById('less-borders');
  const splitView      = document.getElementById('split-view');
  const autoUpdate     = document.getElementById('auto-update');

  hideCrosshairs.addEventListener('change', () => {
    const s = loadSettings(); s.hideCrosshairs = hideCrosshairs.checked;
    saveSettings(s); updatePreview();
  });
  plainFormat.addEventListener('change', () => {
    const s = loadSettings(); s.plainFormat = plainFormat.checked;
    saveSettings(s);
    document.body.classList.toggle('plain-format', s.plainFormat);
    updatePreview();
  });
  lessBorders.addEventListener('change', () => {
    const s = loadSettings(); s.lessBorders = lessBorders.checked;
    saveSettings(s);
    document.body.classList.toggle('less-borders', s.lessBorders);
    updatePreview();
  });
  splitView.addEventListener('change', () => {
    const s = loadSettings(); s.splitView = splitView.checked;
    saveSettings(s);
    const mainContent = document.querySelector('.main-content');
    if (s.splitView) {
      mainContent.classList.add('mode-split');
      switchView('sim');
    } else {
      mainContent.classList.remove('mode-split');
      switchView('code');
    }
    updateMonacoContextAction();
    updateExportMarkdownVisibility();
    if (editor) requestAnimationFrame(() => editor.layout());
  });
  autoUpdate.addEventListener('change', () => {
    const s = loadSettings(); s.autoUpdate = autoUpdate.checked;
    saveSettings(s);
  });

  document.querySelectorAll('input[name="theme"]').forEach(r => {
    r.addEventListener('change', () => {
      if (!r.checked) return;
      const s = loadSettings(); s.theme = r.value;
      saveSettings(s);
      applyTheme(s.theme);
      updatePreview();
    });
  });

  updatePreview();
}

// ---------------------------------------------------------------
// Preview table (small example for the Settings page)
// ---------------------------------------------------------------
function updatePreview() {
  const preview = document.querySelector('.settings-preview');
  if (!preview) return;
  preview.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'preview-table';

  const header = document.createElement('tr');
  ['Insn','C1','C2','C3','C4','C5'].forEach(h => {
    const th = document.createElement('td');
    th.textContent = h;
    header.appendChild(th);
  });
  table.appendChild(header);

  const rows = [
    { inst: 'mov r0,r1',     cells: [{t:'I'},{t:'D'},{t:'EX'},{t:'NA'},{t:'S'}] },
    { inst: 'add r1,r2',     cells: [{t:'I'},{t:'D'},{t:'EX',full:true},{t:'NA',full:true},{t:'S'}] },
    { inst: 'mov.l @r2,r3',  cells: [{t:'I'},{t:'D'},{t:'EX',stall:true},{t:'MA'},{t:'S'}] },
    { inst: 'mac.w @r4+,@r5+',cells: [{t:'I'},{t:'D',lock:true},{t:'MA'},{t:'MA',lock:true},{t:'S'}] },
    { inst: 'nop',           cells: [{t:'I'},{t:'D'},{t:'EX'},{t:'NA'},{t:'S'}] }
  ];

  rows.forEach(r => {
    const tr = document.createElement('tr');
    const td0 = document.createElement('td');
    td0.textContent = r.inst;
    td0.style.textAlign = 'left';
    tr.appendChild(td0);
    r.cells.forEach((c, i) => {
      const td = document.createElement('td');
      td.textContent = c.t;
      td.setAttribute('data-cycle', i + 1);
      if (c.stall) td.classList.add('stall');
      if (c.lock)  td.classList.add('lock');
      if (c.full)  td.classList.add('full');
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  preview.appendChild(table);
}

// ---------------------------------------------------------------
// Sidebar & Split Resizer
// ---------------------------------------------------------------
function setupSidebar() {
  document.querySelectorAll('.sidebar-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  const exportBtn      = document.getElementById('export-btn');
  const exportPopover  = document.getElementById('export-popover');

  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exportPopover.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!exportPopover.contains(e.target) && !exportBtn.contains(e.target)) {
      exportPopover.classList.remove('open');
    }
  });

  document.querySelector('[data-export="copy-link"]').addEventListener('click', () => {
    document.querySelector('.src').value = editor.getValue();
    do_sim();
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('Link copied to clipboard'))
      .catch(() => showToast('Could not copy link'));
    exportPopover.classList.remove('open');
  });

  document.querySelector('[data-export="print"]').addEventListener('click', () => {
    document.querySelector('.src').value = editor.getValue();
    do_sim();
    switchView('sim');
    setTimeout(() => window.print(), 250);
    exportPopover.classList.remove('open');
  });

  document.getElementById('export-md-btn').addEventListener('click', () => {
    exportToMarkdown();
    exportPopover.classList.remove('open');
  });

  document.getElementById('sim-refresh-btn').addEventListener('click', () => {
    forceRefresh();
  });

  const resizer = document.getElementById('split-resizer');
  const viewCode = document.getElementById('view-code');
  const viewSim = document.getElementById('view-sim');
  let isResizing = false;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const containerRect = document.querySelector('.main-content').getBoundingClientRect();
    const offset = e.clientX - containerRect.left;
    const percentage = (offset / containerRect.width) * 100;
    if (percentage > 10 && percentage < 90) {
      viewCode.style.flex = `0 0 ${percentage}%`;
      viewSim.style.flex = `1 1 ${100 - percentage}%`;
      if (editor) editor.layout();
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

// ---------------------------------------------------------------
// Tiny toast notification
// ---------------------------------------------------------------
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}

// ---------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------
require.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }
});

require(['vs/editor/editor.main'], function () {
  applySettings();
  initMonaco();
  setupSidebar();
  setupSettings();
  switchView('code');
});