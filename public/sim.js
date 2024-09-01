const Flags = {
    L: 16, // Lock
    KShift: 6,
    Kick(x) { return (x << this.KShift); }
}

const Stage = {
    I: 0,
    D: 1,
    EX: 3,
    SX: 4,
    F0: 5,
    F1: 6,
    F2: 7,
    F3: 8,
    NA: 9,
    MA: 10,
    S: 11,
    FS: 12,
    Count: 13,
    Mask: 15
};

const StageNames = { }
StageNames[Stage.I] = "I";
StageNames[Stage.D] = "D";
StageNames[Stage.EX] = "EX";
StageNames[Stage.SX] = "SX";
StageNames[Stage.F0] = "F0";
StageNames[Stage.F1] = "F1";
StageNames[Stage.F2] = "F2";
StageNames[Stage.F3] = "F3";
StageNames[Stage.NA] = "NA";
StageNames[Stage.MA] = "MA";
StageNames[Stage.S] = "S";
StageNames[Stage.FS] = "FS";
StageNames[Stage.DL] = "[D]";

const Group = {
    MT: "MT",
    EX: "EX",
    BR: "BR",
    LS: "LS",
    FE: "FE",
    CO: "CO"
};

function isParallel(group1, group2) {
    if (group1 == Group.CO || group2 == Group.CO)
        return false;
    else
        return group1 != group2;
}

const Patterns = {
    // 1-step operation: 1 issue cycle
    // EXT[SU].[BW], MOV, MOV#, MOVA, MOVT, SWAP.[BW], XTRCT, ADD*, CMP*, 
    // DIV*, DT, NEG*, SUB*, AND, AND#, NOT, OR, OR#, TST, TST#, XOR, XOR#, 
    // ROT*, SHA*, SHL*, BF*, BT*, BRA, NOP, CLRS, CLRT, SETS, SETT, 
    // LDS to FPUL, STS from FPUL/FPSCR, FLDI0, FLDI1, FMOV, FLDS, FSTS, 
    // single-/double-precision FABS/FNEG
    1: [
        [Stage.I, Stage.D, Stage.EX, Stage.NA, Stage.S]
    ],

    // Load/store: 1 issue cycle
    // MOV.[BWL]. FMOV*@, LDS.L to FPUL, LDTLB, PREF, STS.L from FPUL/FPSCR
    2: [
        [Stage.I, Stage.D, Stage.EX, Stage.MA, Stage.S]
    ],

    // GBR-based load/store: 1 issue cycle
    // MOV.[BWL]@(d,GBR)
    3: [
        [Stage.I, Stage.D, Stage.SX, Stage.MA, Stage.S]
    ],

    // JMP, RTS, BRAF: 2 issue cycles
    4: [
        [Stage.I, Stage.D, Stage.EX | Flags.Kick(1), Stage.NA, Stage.S],
        [Stage.DL, Stage.EX, Stage.NA, Stage.S]
    ],

    // TST.B: 3 issue cycles
    5: [
        [Stage.I, Stage.D, Stage.SX | Flags.Kick(1), Stage.MA, Stage.S],
        [Stage.DL, Stage.SX | Flags.Kick(2), Stage.NA, Stage.S],
        [Stage.DL, Stage.SX, Stage.MA, Stage.S]
    ],

    // AND.B, OR.B, XOR.B: 4 issue cycles
    6: [
        [Stage.I, Stage.D, Stage.SX | Flags.Kick(1), Stage.MA, Stage.S],
        [Stage.D | Flags.L, Stage.SX | Flags.Kick(2), Stage.NA, Stage.S],
        [Stage.D | Flags.L, Stage.SX | Flags.Kick(3), Stage.NA, Stage.S],
        [Stage.D | Flags.L, Stage.SX, Stage.MA, Stage.S],
    ],

    // TAS.B: 5 issue cycles
    7: [
        [Stage.I, Stage.D, Stage.EX | Flags.Kick(1), Stage.MA, Stage.S],
        [Stage.D | Flags.L, Stage.EX | Flags.Kick(2), Stage.NA, Stage.S],
        [Stage.D | Flags.L, Stage.EX | Flags.Kick(3), Stage.NA, Stage.S],
        [Stage.D | Flags.L, Stage.EX | Flags.Kick(4), Stage.NA, Stage.S],
        [Stage.D | Flags.L, Stage.EX, Stage.MA, Stage.S],
    ],

    8: [
        [ Stage.I, Stage.D, Stage.EX | Flags.Kick(1), Stage.NA, Stage.S ],
        [ Stage.D, Stage.EX | Flags.Kick(1), Stage.NA, Stage.S ],
        [ Stage.D, Stage.EX | Flags.Kick(2), Stage.NA, Stage.S ],
        [ Stage.D, Stage.EX | Flags.Kick(3), Stage.NA, Stage.S ],
        [ Stage.D, Stage.EX, Stage.NA, Stage.S ]
    ],

    9: [
        [ Stage.I, Stage.D, Stage.EX | Flags.Kick(1), Stage.NA, Stage.S ],
        [ Stage.D, Stage.EX | Flags.Kick(1), Stage.NA, Stage.S ],
        [ Stage.D, Stage.EX | Flags.Kick(2), Stage.NA, Stage.S ],
        [ Stage.D, Stage.EX, Stage.NA, Stage.S ]
    ],

    // Single-precision floating-point computation: 1 issue cycle
    // FCMP/EQ,FCMP/GT, FADD,FLOAT,FMAC,FMUL,FSUB,FTRC,FRCHG,FSCHG
    36: [
        [Stage.I, Stage.D, Stage.F1, Stage.F2, Stage.FS]
    ],

    39: [
        [Stage.I, Stage.D, Stage.F1 | Flags.Kick(1), Stage.F2, Stage.FS],
        [Stage.D, Stage.F1 | Flags.Kick(2), Stage.F2, Stage.FS],
        [Stage.D, Stage.F1 | Flags.Kick(3), Stage.F2, Stage.FS],
        [Stage.D, Stage.F1 | Flags.Kick(4), Stage.F2, Stage.FS],
        [Stage.D, Stage.F1, Stage.F2 | Flags.Kick(5), Stage.FS],
        [Stage.F1, Stage.F2, Stage.FS]

    ],

    // 42.  FIPR: 1 issue cycle
    42: [
        [Stage.I, Stage.D, Stage.F0, Stage.F1, Stage.F2, Stage.FS]
    ],

    // Custom: fsqrt fr
    137: [
        [Stage.I, Stage.D, Stage.F1 | Flags.Kick(1), Stage.F2, Stage.FS],
        [Stage.F3, Stage.F3, Stage.F3, Stage.F3, Stage.F3, Stage.F3, Stage.F3, Stage.F3, Stage.F3 | Flags.Kick(2)],
        [Stage.F1, Stage.F2, Stage.FS | Flags.Kick(3)],
        [Stage.F1, Stage.F2, Stage.FS],
    ],

};

function index_of_part(asm, part) {
    for (let i = 0; i < asm.length; i++) {
        if (asm[i] == part || asm[i] == `@${part}`)
            return i;
    }
    throw new Error(`Part ${part} not found in ${asm}`);
}
function rm() {
    return [this.variant[index_of_part(this.asm, "Rm")].replace("@", "")];
}
function rn() {
    return [this.variant[index_of_part(this.asm, "Rn")].replace("@", "")];
}

function none() {
    return [];
}

function r0() {
    return ["R0"];
}

function rmn() {
    return [...rm.apply(this), ...rn.apply(this)];
}

function rmnsr() {
    return [...rmn.apply(this), "SR"];
}

function rnsr() {
    return [...rn.apply(this), "SR"];
}

function sr() {
    return ["SR"]
}

function at_r0m() {
    return  ["R0", this.variant[index_of_part(this.asm, "@(R0,Rm)")].match(/@\(R0,([^)]*)\)/)[1]];
}

function at_d4rm() {
    return  [this.variant[index_of_part(this.asm, "@(disp4,Rm)")].match(/@\([0-9]*,([^)]*)\)/)[1]];
}

function at_r0n() {
    return  ["R0", this.variant[index_of_part(this.asm, "@(R0,Rn)")].match(/@\(R0,([^)]*)\)/)[1]];
}

function rm_at_r0n() {
    return [...rm.apply(this), ...at_r0n.apply(this)];
}

function rm_at_d4rn() {
    return [...rm.apply(this), this.variant[index_of_part(this.asm, "@(disp4,Rn)")].match(/@\([0-9]*,([^)]*)\)/)[1]];
}

function fn() {
    return [this.variant[index_of_part(this.asm, "FRn")]];
}

function fpul() {
    return ["FPUL"];
}


function fnr0n() {
    return [this.variant[index_of_part(this.asm, "FRn")], "R0", this.variant[index_of_part(this.asm, "Rn")]];
}

function r0gbr() {
    return ["R0", "GBR"];
}

function fnm() {
    return [this.variant[index_of_part(this.asm, "FRm")], this.variant[index_of_part(this.asm, "FRn")]];
}

function fmrn() {
    return [this.variant[index_of_part(this.asm, "FRm")], ...rn.apply(this)];
}
function fm_at_r0n() {
    return [this.variant[index_of_part(this.asm, "FRm")], "R0", this.variant[index_of_part(this.asm, "@(R0,Rn)")].match(/@\(R0,([^)]*)\)/)[1]];
}

function fvm() {
    const fvdec = {
        "FV0": ["FR0", "FR1", "FR2", "FR3"],
        "FV4": ["FR4", "FR5", "FR6", "FR7"],
        "FV8": ["FR8", "FR9", "FR10", "FR11"],
        "FV12": ["FR12", "FR13", "FR14", "FR15"],
    };
    const rv = fvdec[this.variant[index_of_part(this.asm, "FVm")]];
    if (!rv)
        throw new Error(`Unknown FVm ${this.variant[index_of_part(this.asm, "FVm")]} in ${this.asm}`);
    return rv;
}
function fvn() {
    const fvdec = {
        "FV0": ["FR0", "FR1", "FR2", "FR3"],
        "FV4": ["FR4", "FR5", "FR6", "FR7"],
        "FV8": ["FR8", "FR9", "FR10", "FR11"],
        "FV12": ["FR12", "FR13", "FR14", "FR15"],
    };
    const rv = fvdec[this.variant[index_of_part(this.asm, "FVn")]];
    if (!rv)
        throw new Error(`Unknown FVn ${this.variant[index_of_part(this.asm, "FVn")]} in ${this.asm}`);
    return rv;
}


const Instructions = {
    1: {asm: ["EXTS.B", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rm, writes: rn },
    2: {asm: ["EXTS.W", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rm, writes: rn },
    3: {asm: ["EXTU.B", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rm, writes: rn },
    4: {asm: ["EXTU.W", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rm, writes: rn },
    5: {asm: ["MOV", "Rm","Rn"], group: Group.MT, issue: 1, latency: 0, pattern: Patterns[1], reads: rm, writes: rn },
    6: {asm: ["MOV", "#imm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: none, writes: rn },
    7: {asm: ["MOVA", "@(disp,PC)","R0"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: none, writes: r0 },
    8: {asm: ["MOV.W", "@(disp,PC)","Rn"], group: Group.LS, issue: 1, latency: 2, pattern: Patterns[2], reads: none, writes: rn },
    9: {asm: ["MOV.L", "@(disp,PC)","Rn"], group: Group.LS, issue: 1, latency: 2, pattern: Patterns[2], reads: none, writes: rn },
    10: {asm: ["MOV.B", "@Rm","Rn"], group: Group.LS, issue: 1, latency: 2, pattern: Patterns[2], reads: rm, writes: rn },
    11: {asm: ["MOV.W", "@Rm","Rn"], group: Group.LS, issue: 1, latency: 2, pattern: Patterns[2], reads: rm, writes: rn },
    12: {asm: ["MOV.L", "@Rm","Rn"], group: Group.LS, issue: 1, latency: 2, pattern: Patterns[2], reads: rm, writes: rn },

    //18 MOV.L @(disp,Rm),Rn LS 1 2 #2
    18: {asm: ["MOV.L", "@(disp4,Rm)","Rn"], group: Group.LS, issue: 1, latency: 2, pattern: Patterns[2], reads: at_d4rm, writes: rn },

    //21 MOV.L @(R0,Rm),Rn LS 1 2 #2
    21: {asm: ["MOV.L", "@(R0,Rm)","Rn"], group: Group.LS, issue: 1, latency: 2, pattern: Patterns[2], reads: at_r0m, writes: rn },

    // 33 MOV.L Rm,@(disp,Rn) LS 1 1 #2
    33: {asm: ["MOV.L", "Rm","@(disp4,Rn)"], group: Group.LS, issue: 1, latency: 1, pattern: Patterns[2], reads: rm_at_d4rn, writes: none },

    // 36 MOV.L Rm,@(R0,Rn) LS 1 1 #2
    36: {asm: ["MOV.L", "Rm","@(R0,Rn)"], group: Group.LS, issue: 1, latency: 1, pattern: Patterns[2], reads: rm_at_r0n, writes: none },
    // 41 MOVT Rn EX 1 1 #1 — — —
    41: {asm: ["MOVT", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: sr, writes: rn },

    49: {asm: ["ADD", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: rn },
    50: {asm: ["ADD", "#imm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: none, writes: rn },
    51: {asm: ["ADDC", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rmnsr, writes: rn },
    52: {asm: ["ADDV", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rmnsr, writes: rn },
    53: {asm: ["CMP/EQ", "#imm","R0"], group: Group.MT, issue: 1, latency: 1, pattern: Patterns[1], reads: r0, writes: sr },
    54: {asm: ["CMP/EQ", "Rm","Rn"], group: Group.MT, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: sr },
    55: {asm: ["CMP/GE", "Rm","Rn"], group: Group.MT, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: sr },
    56: {asm: ["CMP/GT", "Rm","Rn"], group: Group.MT, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: sr },
    57: {asm: ["CMP/HI", "Rm","Rn"], group: Group.MT, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: sr },
    58: {asm: ["CMP/HS", "Rm","Rn"], group: Group.MT, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: sr },
    59: {asm: ["CMP/PL", "Rn"], group: Group.MT, issue: 1, latency: 1, pattern: Patterns[1], reads: rn, writes: sr },
    60: {asm: ["CMP/PZ", "Rn"], group: Group.MT, issue: 1, latency: 1, pattern: Patterns[1], reads: rn, writes: sr },
    61: {asm: ["CMP/STR", "Rm","Rn"], group: Group.MT, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: sr },
    62: {asm: ["DIV0S", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: sr },
    63: {asm: ["DIV0U"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: none, writes: sr },
    64: {asm: ["DIV1", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rm, writes: rnsr },

    67: {asm: ["DT", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rn, writes: rnsr },

    73: {asm: ["NEG", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rm, writes: rn },

    75: {asm: ["SUB", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: rn },

    78: {asm: ["AND", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: rn  },
    79: {asm: ["AND", "#imm","R0"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: none, writes: r0 },
    80: {asm: ["AND.B", "#imm","@(R0,GBR)"], group: Group.CO, issue: 4, latency: 4, pattern: Patterns[6], reads: r0gbr, writes: none },

    81: {asm: ["NOT", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rm, writes: rn  },
    82: {asm: ["OR", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: rn  },
    83: {asm: ["OR", "#imm","R0"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: r0, writes: r0  },

    86: {asm: ["TST", "Rm","Rn"], group: Group.MT, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: sr  },
    87: {asm: ["TST", "#imm","R0"], group: Group.MT, issue: 1, latency: 1, pattern: Patterns[1], reads: r0, writes: sr  },

    89: {asm: ["XOR", "Rm","Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: rn  },
    90: {asm: ["XOR", "#imm","R0"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: r0, writes: r0  },

    92: {asm: ["ROTL", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rnsr, writes: rnsr },
    93: {asm: ["ROTR", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rnsr, writes: rnsr },
    94: {asm: ["ROTCL", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rnsr, writes: rnsr },
    95: {asm: ["ROTCR", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rnsr, writes: rnsr },
    96: {asm: ["SHAD", "Rm", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: rn },
    97: {asm: ["SHAL", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rn, writes: rnsr },
    98: {asm: ["SHAR", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rn, writes: rnsr },
    99: {asm: ["SHLD", "Rm", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rmn, writes: rn },
    100: {asm: ["SHLL", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rn, writes: rnsr },
    101: {asm: ["SHLL2", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rn, writes: rn },
    102: {asm: ["SHLL8", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rn, writes: rn },
    103: {asm: ["SHLL16", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rn, writes: rn },
    104: {asm: ["SHLR", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rn, writes: rnsr },
    105: {asm: ["SHLR2", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rn, writes: rn },
    106: {asm: ["SHLR8", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rn, writes: rn },
    107: {asm: ["SHLR16", "Rn"], group: Group.EX, issue: 1, latency: 1, pattern: Patterns[1], reads: rn, writes: rn },

    // 108 BF disp BR 1 2 (or 1) #1
    108: {asm: ["BF"], group: Group.BR, issue: 1, latency: 2, pattern: Patterns[1], reads: none, writes: none },

    // 112 BRA disp BR 1 2 #1
    112: {asm: ["BRA"], group: Group.BR, issue: 1, latency: 2, pattern: Patterns[1], reads: none, writes: none },

    // 118 RTS CO 2 3 #4 — — —
    118: {asm: ["RTS"], group: Group.CO, issue: 2, latency: 3, pattern: Patterns[4], reads: none, writes: none },

    119: {asm: ["NOP"], group: Group.MT, issue: 1, latency: 0, pattern: Patterns[1], reads: none, writes: none },

    121: {asm: ["CLRS"], group: Group.CO, issue: 1, latency: 1, pattern: Patterns[1], reads: none, writes: sr },
    122: {asm: ["CLRT"], group: Group.MT, issue: 1, latency: 1, pattern: Patterns[1], reads: none, writes: sr },
    123: {asm: ["SETS"], group: Group.CO, issue: 1, latency: 1, pattern: Patterns[1], reads: none, writes: sr },
    124: {asm: ["SETT"], group: Group.MT, issue: 1, latency: 1, pattern: Patterns[1], reads: none, writes: sr },


    171: {asm: ["FLDI0", "FRn"], group: Group.LS, issue: 1, latency: 0, pattern: Patterns[1], reads: none, writes: fn },
    172: {asm: ["FLDI1", "FRn"], group: Group.LS, issue: 1, latency: 0, pattern: Patterns[1], reads: none, writes: fn },
    173: {asm: ["FMOV", "FRm","FRn"], group: Group.LS, issue: 1, latency: 0, pattern: Patterns[1], reads: fn, writes: fn },
    174: {asm: ["FMOV.S","@Rm","FRn"], group: Group.LS, issue: 1, latency: 2, pattern: Patterns[2], reads: rm, writes: fn },
    // 175: {asm: ["FMOV.S", "@Rm+","FRn"], group: Group.LS, issue: 1, latency: 1/2, pattern: Patterns[2] },
    176: {asm: ["FMOV.S", "@(R0,Rm)","FRn"], group: Group.LS, issue: 1, latency: 2, pattern: Patterns[2], reads: at_r0m, writes: fn },
    177: {asm: ["FMOV.S", "FRm","@Rn"], group: Group.LS, issue: 1, latency: 1, pattern: Patterns[2], reads: fmrn, writes: none },
    178: {asm: ["FMOV.S", "FRm","@-Rn"], group: Group.LS, issue: 1, latency: 1, pattern: Patterns[2], reads: fn, writes: rn },
    179: {asm: ["FMOV.S", "FRm","@(R0,Rn)"], group: Group.LS, issue: 1, latency: 1, pattern: Patterns[2], reads: fm_at_r0n, writes: none },
    180: {asm: ["FLDS", "FRm","FPUL"], group: Group.LS, issue: 1, latency: 0, pattern: Patterns[1], reads: fn, writes: fpul },
    181: {asm: ["FSTS", "FPUL","FRn"], group: Group.LS, issue: 1, latency: 0, pattern: Patterns[1], reads: fpul, writes: fn },

    183: {asm: ["FADD", "FRm","FRn"], group: Group.FE, issue: 1, latency: 3 /*3/4*/, pattern: Patterns[36], reads: fnm, writes: fn },

    
    189: {asm: ["FMUL", "FRm","FRn"], group: Group.FE, issue: 1, latency: 3 /*3/4*/, pattern: Patterns[36], reads: fnm, writes: fn },
    
    // 191 FSQRT FRn FE 1 11/12 #37 F3 2 9 F1 10 1
    191: {asm: ["FSQRT", "FRn"], group: Group.FE, issue: 1, latency: 11 /*11/12*/, pattern: Patterns[137], reads: fn, writes: fn },

    192: {asm: ["FSUB", "FRm","FRn"], group: Group.FE, issue: 1, latency: 3 /*3/4*/, pattern: Patterns[36], reads: fnm, writes: fn },
    
    // 231 FIPR FVm,FVn FE 1 4/5 #42 F1 3 1
    231: {asm: ["FIPR", "FVm","FVn"], group: Group.FE, issue: 1, latency: 4 /*4/5*/, pattern: Patterns[42], reads: fvm, writes: fvn },
};

// Registers
// 16 gprs for now, as a bitfield
let instructions_rainbow = {}

function cartesianProduct(arrays) {
    return arrays.reduce((acc, array) => {
        return acc.flatMap(accItem => {
            return array.map(arrayItem => {
                return [...accItem, arrayItem];
            });
        });
    }, [[]]);
}

function deepcopy(v) {
    return JSON.parse(JSON.stringify(v))
}

function getVariants(str) {
    switch(str) {
        case "Rm":
        case "Rn":
            return ["R0", "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R12", "R13", "R14", "R15"];
        case "@Rm":
        case "@Rn":
            return ["@R0", "@R1", "@R2", "@R3", "@R4", "@R5", "@R6", "@R7", "@R8", "@R9", "@R10", "@R11", "@R12", "@R13", "@R14", "@R15"];
        case "#imm":
            return Array.from({ length: 384 }, (_, index) => `#${index-128}`);
        case "@(disp,PC)":
            return Array.from({ length: 256 }, (_, index) => `@(${index},PC)`);
        case "@(R0,Rm)":
        case "@(R0,Rn)":
            return ["@(R0,R0)", "@(R0,R1)", "@(R0,R2)", "@(R0,R3)", "@(R0,R4)", "@(R0,R5)", "@(R0,R6)", "@(R0,R7)", "@(R0,R8)", "@(R0,R9)", "@(R0,R10)", "@(R0,R11)", "@(R0,R12)", "@(R0,R13)", "@(R0,R14)", "@(R0,R15)"];
        case "FRm":
        case "FRn":
            return ["FR0", "FR1", "FR2", "FR3", "FR4", "FR5", "FR6", "FR7", "FR8", "FR9", "FR10", "FR11", "FR12", "FR13", "FR14", "FR15"];
        case "FVm":
        case "FVn":
            return ["FV0", "FV4", "FV8", "FV12"];
        case "@(disp4,Rn)":
        case "@(disp4,Rm)":
            return Array.from({ length: 16*4 }, (_, index) =>  Array.from({ length: 16 }, (_, index2) => `@(${index},R${index2})`)).flat();
        default:
            return [str]
    }
}

function processInsn(no_comments) {
    return no_comments
        .replace(/\s+/g, " ")
        .replace(/\s*,\s*/g, ",")
        .replace(/@\s*/g, "@")
        .replace(/\s*\(\s*/g, "(")
        .replace(/\s*\)\s*/g, ")")
        .toLowerCase()
        .trim();
}

for (const index of Object.keys(Instructions)) {
    const insn = Instructions[index];

    const parts = insn.asm;

    let insn_variants = cartesianProduct(parts.map(getVariants));
    for (insn_variant of insn_variants) {
        let insn_rain = deepcopy(insn)
        insn_rain.reads = insn.reads;
        insn_rain.writes = insn.writes;
        insn_rain.variant = insn_variant;
        instructions_rainbow[processInsn((insn_variant[0] + " " + insn_variant.slice(1).join(",")))] = insn_rain;
    }
}

function assemble(lines) {
    let rv = []
    let pc = 0;
    let track = 0;
    for (line of lines.split("\n")) {
        let no_comments = line.split(/(;|!|\/\/)/)[0].replace("\t", " ").trim();

        if (no_comments.length) {
            processed = processInsn(no_comments);
            if (processed[0] == '.') {
                console.log(`Skipping directive: ${processed} from ${line}`);
                continue;
            }
            if (processed[processed.length - 1] == ':') {
                console.log(`Skipping label: ${processed} from ${line}`);
                continue;
            }
            let def = instructions_rainbow[processed];
            if (!def) {
                // special handling for branches
                const op = processed.split(" ")[0];
                def = instructions_rainbow[op];
            }

            if (!def) {
                console.error(`Unknown instruction: ${processed} from ${line}`);
                return null;
            }
            rv.push({
                pc: pc, track: track, text: processed, def: def, pipe: -1, step: -1,
                format: function() {
                    return `${this.pc.toString(16).padStart(8,"0")} ${this.text}`;
                }
            });
            track += def.pattern.length;
            pc += 2;
        }
    }

    rv.tracks = track;

    return rv;
}

function getSeq(insn, num, program_order) {
    let seq = {};

    seq.stage = function() {
        return this.pattern[this.step] & Stage.Mask;
    }
    seq.stage_lock = function() {
        return this.pattern[this.step] & Flags.L;
    }
    seq.kick = function() {
        return this.pattern[this.step] >> Flags.KShift;
    }
    seq.next_stage = function() {
        let rv = this.pattern[this.step + 1];
        return rv ? rv & Stage.Mask : rv;
    }
    seq.is_last_stage = function() {
        return this.step == this.pattern.length - 1;
    }
    seq.pattern = deepcopy(insn.def.pattern[num]);
    seq.step = 0;
    seq.program_order = program_order + num;
    seq.stall = false;
    seq.insn = insn;
    seq.reads = [...new Set(insn.def.reads())];
    seq.writes = [... new Set(insn.def.writes())];
    seq.latency = insn.def.latency;
    seq.group = insn.def.group;
    seq.pc = insn.pc;
    seq.track = insn.track + num;

    return seq;
}

function generateTable(tableArray) {
    const outerContainer = document.querySelector(".result-outer");
    // Clear the outer container
    outerContainer.innerHTML = "";

    // Determine the number of rows by finding the length of the first column
    const numRows = tableArray[0].length;

    // Calculate the number of tables needed
    const columnsPerTable = 10;
    const numTables = Math.ceil((tableArray.length - 1) / columnsPerTable);

    // Find the maximum length of the text in column 0
    const maxTextLength = tableArray[0].reduce((maxLength, cell) => {
        return Math.max(maxLength, cell.text ? cell.text.length : 0);
    }, 0);

    // Create the extra table at the beginning with only the first column
    const extraTable = document.createElement('table');
    extraTable.classList.add("print-hidden");

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = document.createElement('tr');
        if (tableArray[0][rowIndex].pc !== undefined) {
            row.classList.add(`row-insn-${tableArray[0][rowIndex].pc}`);
        
            if (rowIndex == 0 || tableArray[0][rowIndex - 1].pc != tableArray[0][rowIndex].pc) {
                row.classList.add("start");
            }
            if (rowIndex + 1 == numRows || tableArray[0][rowIndex + 1].pc != tableArray[0][rowIndex].pc) {
                row.classList.add("end");
            }
        }

        const cell0 = document.createElement('td');
        const paddedText = (tableArray[0][rowIndex].text ? tableArray[0][rowIndex].text : "").padEnd(maxTextLength, ' ').replace(/ /g, "&nbsp;");
        if (tableArray[0][rowIndex].explanation) {
            cell0.innerHTML = `<span class="tooltip"><span class="tooltiptext">${tableArray[0][rowIndex].explanation}</span>${paddedText}</span>`;
        } else {
            cell0.innerHTML = `<span class="tooltip"></span>${paddedText}`;
        }

        if (tableArray[0][rowIndex].id) {
            cell0.setAttribute("data-insn", tableArray[0][rowIndex].id);
        }
        if (tableArray[0][rowIndex].result_ready) {
            cell0.setAttribute("data-result-ready", tableArray[0][rowIndex].result_ready);
        }
        if (tableArray[0][rowIndex].stall) {
            cell0.classList.add("stall");
        }
        if (tableArray[0][rowIndex].full) {
            cell0.classList.add("full");
        }
        if (tableArray[0][rowIndex].lock) {
            cell0.classList.add("lock");
        }
        if (tableArray[0][rowIndex].screen_hidden_text) {
            cell0.classList.add("screen-hidden-text");
        }
        for (const element of [cell0, cell0.children[0]]) {
            if (tableArray[0][rowIndex].relevant) {
                element.setAttribute("data-relevant", tableArray[0][rowIndex].relevant);
            }
            if (tableArray[0][rowIndex].current) {
                element.setAttribute("data-current", tableArray[0][rowIndex].current);
            }
            element.setAttribute("data-cycle", `0`);
        }

        row.appendChild(cell0);
        extraTable.appendChild(row);
    }

    // Append the extra table to the outer container
    outerContainer.appendChild(extraTable);

    const innerContainer = document.createElement('div');
    innerContainer.classList.add("result");
    outerContainer.appendChild(innerContainer);

    // Generate the main tables and wrap each in a div with class 'result'
    for (let tableIndex = 0; tableIndex < numTables; tableIndex++) {
        // Create a wrapper div with class 'result'
        
        // Create a table element for each set of columns
        const table = document.createElement('table');

        // Iterate over each row index
        for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
            // Create a new row
            const row = document.createElement('tr');
            if (tableArray[0][rowIndex].pc !== undefined) {
                row.classList.add(`row-insn-${tableArray[0][rowIndex].pc}`);
            
                if (rowIndex == 0 || tableArray[0][rowIndex - 1].pc != tableArray[0][rowIndex].pc) {
                    row.classList.add("start");
                }
                if (rowIndex + 1 == numRows || tableArray[0][rowIndex + 1].pc != tableArray[0][rowIndex].pc) {
                    row.classList.add("end");
                }
            }
            let first = true;

            // Always insert column 0 first with the screen-hidden class for tableIndex != 0
            const colData0 = tableArray[0];
            const cell0 = document.createElement('td');
            cell0.classList.add("screen-hidden"); // Add screen-hidden class to column 0
            if (first) {
                cell0.style = `z-index: ${numRows - rowIndex + 1};`;
                first = false;
            }
            if (colData0[rowIndex]) {
                // Pad the text in column 0 to the maximum length
                const paddedText = (colData0[rowIndex].text ? colData0[rowIndex].text : "").padEnd(maxTextLength, ' ').replace(/ /g, "&nbsp;");
                if (colData0[rowIndex].explanation) {
                    cell0.innerHTML = `<span class="tooltip"><span class="tooltiptext">${colData0[rowIndex].explanation}</span>${paddedText}</span>`;
                } else {
                    cell0.innerHTML = `<span class="tooltip"></span>${paddedText}`;
                }
                if (colData0[rowIndex].id) {
                    cell0.setAttribute("data-insn", colData0[rowIndex].id);
                }
                if (colData0[rowIndex].result_ready) {
                    cell0.setAttribute("data-result-ready", colData0[rowIndex].result_ready);
                }
                if (colData0[rowIndex].stall) {
                    cell0.classList.add("stall");
                }
                if (colData0[rowIndex].full) {
                    cell0.classList.add("full");
                }
                if (colData0[rowIndex].lock) {
                    cell0.classList.add("lock");
                }
                if (colData0[rowIndex].screen_hidden_text) {
                    cell0.classList.add("screen-hidden-text");
                }
                for (const element of [cell0, cell0.children[0]]) {
                    if (colData0[rowIndex].relevant) {
                        element.setAttribute("data-relevant", colData0[rowIndex].relevant);
                    }
                    if (colData0[rowIndex].current) {
                        element.setAttribute("data-current", colData0[rowIndex].current);
                    }
                    element.setAttribute("data-cycle", `0`);
                }
            }
            row.appendChild(cell0);

            // Flag to check if all other columns are empty
            let onlyColumn0HasText = true;

            // Iterate over each column within the current chunk, starting from column 1
            let columnCount = 1; // Keep track of the number of columns
            for (let colIndex = tableIndex * columnsPerTable + 1; colIndex < Math.min((tableIndex + 1) * columnsPerTable + 1, tableArray.length); colIndex++) {
                const colData = tableArray[colIndex];

                // Create a new cell (td element)
                const cell = document.createElement('td');
                if (colData[rowIndex]) {
                    if (colData[rowIndex].explanation) {
                        cell.innerHTML = `<span class="tooltip"><span class="tooltiptext">${colData[rowIndex].explanation}</span>${colData[rowIndex].text}</span>`;
                        // If this column has text, set the flag to false
                        onlyColumn0HasText = false;
                    } else {
                        cell.innerHTML = `<span class="tooltip"></span>`;
                    }
                    if (colData[rowIndex].id) {
                        cell.setAttribute("data-insn", colData[rowIndex].id);
                    }
                    if (colData[rowIndex].result_ready) {
                        cell.setAttribute("data-result-ready", colData[rowIndex].result_ready);
                    }
                    if (colData[rowIndex].stall) {
                        cell.classList.add("stall");
                    }
                    if (colData[rowIndex].full) {
                        cell.classList.add("full");
                    }
                    if (colData[rowIndex].lock) {
                        cell.classList.add("lock");
                    }
                    if (colData[rowIndex].screen_hidden_text) {
                        cell.classList.add("screen-hidden");
                    }
                    if (colData[rowIndex].screen_hidden_text) {
                        cell.classList.add("screen-hidden-text");
                    }
                    for (const element of [cell, cell.children[0]]) {
                        if (colData[rowIndex].relevant) {
                            element.setAttribute("data-relevant", colData[rowIndex].relevant);
                        }
                        if (colData[rowIndex].current) {
                            element.setAttribute("data-current", colData[rowIndex].current);
                        }
                        element.setAttribute("data-cycle", `${colIndex}`);
                    }
                }

                // Append the cell to the row
                row.appendChild(cell);
                columnCount++; // Increment the column count
            }

            // If the row has less than 10 columns, pad with empty cells
            while (columnCount <= columnsPerTable) {
                const emptyCell = document.createElement('td');
                emptyCell.classList.add("screen-hidden"); // Add screen-hidden class to padded columns
                row.appendChild(emptyCell);
                columnCount++;
            }

            // If only column 0 has text, add the .print-hidden class to the row
            if (onlyColumn0HasText) {
                row.classList.add("print-hidden");
            }

            // Append the row to the table
            table.appendChild(row);
        }

        // Append the table to the result wrapper
        innerContainer.appendChild(table);
    }
}



let urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("source")) {
    let compressedData = Uint8Array.from(atob(urlParams.get("source")), c => c.charCodeAt(0));
    document.querySelector(".src").value = new TextDecoder().decode(pako.inflate(compressedData));        
}

function do_sim() {
    let insns = assemble(document.querySelector(".src").value)
    if (!insns) {
        document.body.classList.add("error")
        return;
    }
    let data = pako.deflate(new TextEncoder().encode(document.querySelector(".src").value));
    let currentUrl = new URL(window.location.href);
    let binaryString = Array.from(data).map(byte => String.fromCharCode(byte)).join('');
    window.history.replaceState({}, '', `${currentUrl.pathname}?source=${encodeURIComponent(btoa(binaryString))}`);

    document.body.classList.remove("error")

    let pc = 0;
    let cycle = 0;
    let program_order = 0;
    let in_flight = []

    let table = [];
    let initial_column = Array.from({length: insns.tracks}, (_, index) => null);
    for (let i = 0; i < insns.length; i++) {
        initial_column[insns[i].track] = {
            id: `${insns[i].pc}`,
            text: insns[i].format(), 
            explanation:`group: ${insns[i].def.group}, issue: ${insns[i].def.issue}, latency: ${insns[i].def.latency}${insns[i].def.desc ? "<br/>" + insns[i].def.desc : ""}` ,
            pc: insns[i].pc,
            current: `.row-insn-${insns[i].pc}`
        };

        for (let j = 1; j < insns[i].def.pattern.length; j++) {
            if (!initial_column[insns[i].track + j]) {
                initial_column[insns[i].track + j] = deepcopy(initial_column[insns[i].track]);
            }

            initial_column[insns[i].track + j].screen_hidden_text = true;
        }
    }

    initial_column.unshift({text: "inst\\cycle", explanation: "Instruction vs Cycle Number"});
    table.push(initial_column);

    let provides = { 
        "R0":  [],
        "R1":  [],
        "R2":  [],
        "R3":  [],
        "R4":  [],
        "R5":  [],
        "R6":  [],
        "R7":  [],
        "R8":  [],
        "R9":  [],
        "R10": [],
        "R11": [],
        "R12": [],
        "R13": [],
        "R14": [],
        "R15": [],

        "FR0": [],
        "FR1": [],
        "FR2": [],
        "FR3": [],
        "FR4": [],
        "FR5": [],
        "FR6": [],
        "FR7": [],
        "FR8": [],
        "FR9": [],
        "FR10": [],
        "FR11": [],
        "FR12": [],
        "FR13": [],
        "FR14": [],
        "FR15": [],

        "SR": [],
        "FPUL": [],
        "GBR": []
    };

    function data_provided_by(provide_seqs, seq) {
        return provide_seqs.some(x => x.insn != seq.insn && x.program_order < seq.program_order);
    }
    let stage_lock = {}

    for(;;) {
        if (in_flight.length == 0 && pc == insns.length || cycle > 1000)
            break;
        
        table.push(Array.from({length: insns.tracks}, (_, index) => ({})));
        const last_column = table[table.length - 1];

        for (let i = 0; i < insns.length; i++) {
            for (let j = 0; j < insns[i].def.pattern.length; j++) {
                last_column[insns[i].track + j].current = `.row-insn-${insns[i].pc}`;
            }
        }

        let toremove = [];
        for (let seq_index = 0; seq_index < in_flight.length; seq_index++) {
            let seq = in_flight[seq_index];
                
            let current_stage = seq.stage();
            let next_stage = seq.next_stage();
            let current_stage_name = StageNames[current_stage];
            let next_stage_name = StageNames[next_stage];

            const in_next_stage = in_flight.filter(x => x != seq && x.stage() == next_stage);

            if (in_next_stage.length == 2 ) {
                relevant_seqs = in_next_stage;
                last_column[seq.track] = { id: `step-${seq.track}-${cycle}`, seq: seq, lock: stage_lock[seq.stage()] == seq, stall:true, text: `${current_stage_name}*${next_stage_name}`, explanation: `Already two instructions @ Stage ${next_stage_name}<br/> ${in_next_stage.map(x => `[${x.group}: ${x.insn.format()} @ ${StageNames[x.stage()]}]`).join("<br />")}` };
                last_column[seq.track].relevant = JSON.stringify(relevant_seqs.map(x => [`[data-insn="${x.insn.pc}"]`, `[data-insn="step-${x.track}-${cycle}"]`]).flat());
                seq.stall = true;
            } else if (stage_lock[next_stage] && stage_lock[next_stage] != seq) {
                let relevant_seqs = [stage_lock[next_stage]];
                last_column[seq.track] = { id: `step-${seq.track}-${cycle}`, seq: seq, lock: stage_lock[seq.stage()] == seq, stall:true, text: `${current_stage_name}~${next_stage_name}`, explanation: `Stage Locked: ${next_stage_name}<br/>${relevant_seqs.map(x => `[${x.group}: ${x.insn.format()}]`).join("<br/>")}` };
                last_column[seq.track].relevant = JSON.stringify(relevant_seqs.map(x => [`[data-insn="${x.insn.pc}"]`, `[data-insn="step-${x.track}-${cycle}"]`]).flat());
            } else if ( (next_stage != Stage.D) &&  !in_next_stage.every(x => x.program_order > seq.program_order || isParallel(x.group, seq.group))) {
                let relevant_seqs = in_next_stage.filter(x => !isParallel(x.group, seq.group));
                last_column[seq.track] = { id: `step-${seq.track}-${cycle}`, seq: seq, lock: stage_lock[seq.stage()] == seq, stall:true, text: `${current_stage_name}!${next_stage_name}`, explanation: `Resource hazard: ${seq.group} @ Stage ${next_stage_name}<br/>${in_next_stage.filter(x => x.program_order <= seq.program_order && !isParallel(x.group, seq.group)).map(x => `[${x.group}: ${x.insn.format()} @ ${StageNames[x.stage()]}]`).join("<br/>")}` };
                last_column[seq.track].relevant = JSON.stringify(relevant_seqs.map(x => [`[data-insn="${x.insn.pc}"]`, `[data-insn="step-${x.track}-${cycle}"]`]).flat());
                seq.stall = true;
            } else if ( (current_stage != Stage.I) && seq.reads.some(reg => data_provided_by(provides[reg], seq))) {
                let relevant_seqs = seq.reads.map(reg => provides[reg].filter( provides_seq => provides_seq.program_order < seq.program_order)).flat(Infinity);
                last_column[seq.track] = { id: `step-${seq.track}-${cycle}`, seq: seq, lock: stage_lock[seq.stage()] == seq, stall:true, text: `${current_stage_name}|${next_stage_name}`, explanation: `Flow Dependency<br/>${seq.reads.map(reg => provides[reg].filter( provides_seq => provides_seq.program_order < seq.program_order).map(provides_seq => `${reg}: ${provides_seq.insn.format()}`)).flat(Infinity).join("<br/>")}` };
                last_column[seq.track].relevant = JSON.stringify(relevant_seqs.map(x => [`[data-insn="${x.insn.pc}"]`, `[data-result-ready="${x.program_order}"]`]).flat());
                seq.stall = true;
            } else if ( (current_stage != Stage.I) && seq.writes.some(reg => data_provided_by(provides[reg], seq))) {
                let relevant_seqs = seq.writes.map(reg => provides[reg].filter( provides_seq => provides_seq.program_order < seq.program_order)).flat(Infinity);
                last_column[seq.track] = { id: `step-${seq.track}-${cycle}`, seq: seq, lock: stage_lock[seq.stage()]== seq, stall:true, text: `${current_stage_name}^${next_stage_name}`, explanation: `Output Dependency<br/>${seq.writes.map(reg => provides[reg].filter( provides_seq => provides_seq.program_order < seq.program_order).map(provides_seq => `${reg}: ${provides_seq.insn.format()}`)).flat(Infinity).join("<br/>")}` };
                last_column[seq.track].relevant = JSON.stringify(relevant_seqs.map(x => [`[data-insn="${x.insn.pc}"]`, `[data-result-ready="${x.program_order}"]`]).flat());
                seq.stall = true;
            } else {
                seq.stall = false;
                if (seq.stage_lock()) {
                    stage_lock[seq.stage()] = null;
                }
                seq.step++;
                if (seq.stage_lock()) {
                    stage_lock[seq.stage()] = seq;
                }
                if (!seq.next_stage()) {
                    toremove.push(seq);
                }
                let result_ready = undefined;
                if (seq.step == seq.latency + 1) {
                    result_ready = seq.program_order;
                }
                if (seq.step == seq.latency + 2) {
                    seq.writes.forEach(reg => provides[reg] = provides[reg].filter(e => e !== seq));
                }
                if (seq.kick()) {
                    let kick_seq = getSeq(seq.insn, seq.kick(), seq.program_order);
                    if (kick_seq.stage_lock()) {
                        stage_lock[kick_seq.stage()] = kick_seq;
                    }
                    in_flight.splice(in_flight.indexOf(seq)+1, 0, kick_seq);
                    last_column[kick_seq.track] = {id: `step-${kick_seq.track}-${cycle}`, seq: kick_seq, lock: stage_lock[kick_seq.stage()] == kick_seq, text: StageNames[kick_seq.stage()], explanation: `No Stall, Group: ${kick_seq.group}${stage_lock[kick_seq.stage()]?`<br/>Stage Lock: ${StageNames[kick_seq.stage()]}`: ""}`};
                    last_column[kick_seq.track].current = `.row-insn-${kick_seq.insn.pc}`;
                    seq_index++;
                }
                
                last_column[seq.track] = { id: `step-${seq.track}-${cycle}`, seq: seq, lock: stage_lock[seq.stage()] == seq, text: StageNames[next_stage], explanation: `No Stall, Group: ${seq.group}${stage_lock[seq.stage()]?`<br/>Stage Lock: ${StageNames[seq.stage()]}`: ""}`, result_ready: result_ready};
            }

            last_column[seq.track].current = `.row-insn-${seq.insn.pc}`;
        }


        for (let stage = 0; stage < Stage.Count; stage++) {
            const in_stage_exec = in_flight.filter(seq => seq.stage() == stage && !seq.stall);
            if (in_stage_exec.length == 2) {
                in_stage_exec.forEach(seq => {
                    last_column.forEach(x => {
                        if (x && x.seq == seq) {
                            x.full = true;
                            x.explanation += `<br/>Fully Utilized`;
                        }
                    })
                });
            }
        }

        for (seq of toremove) {
            in_flight = in_flight.filter(e => e !== seq);

            if (in_flight.filter(x => x.insn == seq.insn).length == 0) {
                if (seq.step == seq.latency + 1) {
                    seq.writes.forEach(reg => provides[reg] = provides[reg].filter(e => e !== seq));
                } else {
                    seq.writes.forEach(reg => {
                        if (provides[reg].filter(e => e == seq).length) {
                            throw new Error(`Instruction finished before all data written ${seq.insn.format()}`);
                        }
                    });
                }
            }
        }

        const in_i_stage = in_flight.filter(seq => seq.stage() == Stage.I);

        for (let pipe = 0; pipe < 2-in_i_stage.length && pc != insns.length; pipe++) {
            let insn = insns[pc++];
            let seq = getSeq(insn, 0, program_order);
            program_order += insn.def.pattern.length;
            in_flight.push(seq);
            insn.def.writes().forEach(reg => provides[reg].push(seq));
            last_column[seq.track] = { id: `step-${seq.track}-${cycle}`, seq: seq, text: StageNames[Stage.I], explanation: `No Stall, Group: ${insn.def.group}`};
            last_column[seq.track].current = `.row-insn-${seq.insn.pc}`;
        }

        last_column.unshift({text: cycle.toString(), explanation: "Cycle Number"})
        cycle++;
    }

    generateTable(table);

}

do_sim();

let lastX = 0;
let lastY = 0;

// Prevent text selection
document.addEventListener('mousedown', function(event) {
    if (!event.target.id && event.target.tagName === 'TD') {
        event.preventDefault();
    }
});

// Scroll on drag
document.addEventListener('mousemove', function(event) {
    if (!event.target.id && event.target.tagName === 'TD') {
        if (event.buttons == 1) {
            event.preventDefault();
            window.scrollBy(0, lastY - event.clientY);
            document.querySelector(".result").scrollLeft += lastX - event.clientX;
        }
    }
    lastX = event.clientX;
    lastY = event.clientY;
});

document.addEventListener("mouseover", function(e) {
    document.querySelectorAll(".marked").forEach(x => x.classList.remove("marked"));
    document.querySelectorAll(".current").forEach(x => x.classList.remove("current"));
    document.querySelectorAll(".current-cycle").forEach(x => x.classList.remove("current-cycle"));

    if (e.target.getAttribute("data-relevant")) {
        let relevant_elements = JSON.parse(e.target.getAttribute("data-relevant"));
        for (element of relevant_elements) {
            document.querySelectorAll(element).forEach(x => x.classList.add("marked"));
        }
    }
    if (!document.getElementById("hide-crosshairs").checked) {
        if (e.target.getAttribute("data-current")) {
            let element = e.target.getAttribute("data-current");
            document.querySelectorAll(element).forEach(x => x.classList.add("current"));
        }
        if (e.target.getAttribute("data-cycle")) {
            let element = e.target.getAttribute("data-cycle");
            document.querySelectorAll(`[data-cycle="${element}"]`).forEach(x => x.classList.add("current-cycle"));
        }
    }
});

function copy_url(e) {
    navigator.clipboard.writeText(window.location.href);
    e.target.classList.add("copied");
    setTimeout(() => {
        e.target.classList.remove("copied");
    }, 2000);
}