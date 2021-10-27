#include <getopt.h>  // unistd might not work
#include <unistd.h>

#include <cassert>
#include <cstdio>
#include <regex>
#include <sstream>
#include <stack>
#include <string>
#include <vector>

using namespace std;

const char* USAGE  = R"-(
Usage: %s [options] [strings...]
)-";

const char* HELP   = R"-(
Markdown-like Formatter by Tooster, @SVERSION
Homepage: @HOMEPAGE

Description:
    Translate liquid-like tags '{<format>--' and '--}' to ANSI formattings.
    When no arguments are passed it reads input from STDIN. Otherwise args
    are translated. Remember to quote arguments if used in args.

Options:
    -v --version            get version string (since v1.4)
    -l --legend             show formatting legend
    -s --strip              strip off formatting sequences (tags)
    -e --escape             escape sequences (\[\abrnftv])
    -S --no-sanitize        don't insert format-reset on EOF
       --demo               show demo
    -h --help               displays this help

Overview:
    Formats use a stack but they don't have to balance. Formatting is greedy,
    so whenever a tag is encountered it is translated to ANSI. This basically
    means, that it's possible to have leftover formats in terminal if closing
    tags were missing due to unexpected data end or simply unbalanced tags.

    Formatter follows 'best efford' ideology -- parses whatever it can and
    never crashes. Unrecognized format is returned as string.

    This program is meant to be used in pipes of programs that don't want to
    depend on any fancy formatting libraries. It's meant to be simple to use
    in existing codebase - you just have to edit strings printed by program
    to include '{--' '--}' tags.

    Strip option is useful when you have to preserve a file that you want to
    display later with colors, but also need to get rid of all formatting
    characters. For now tags are hardcoded, which poses danger to files that
    have {-- and --} as content. In the future there will be an option to
    provide custom tags

Formatting and examples:
    TL;DR legend of formats and how it works is available under '-l' option.

    (Below 'f' is used as an alias for 'formatter')

    To select foreground use single color letter. Use capitalized letter for
    bright* version:
     $ f "{r--red--} {R--BRIGHT RED--}"

    First letter sets the foreground, second sets the background:
     $ f "{RB*--BRIGHT RED on BRIGHT BLUE and bold--}"
    They don't have to next to each other:
     $ f "{R*_B--works as well--}"

    To set background color alone use [;] (current top color) as foreground:
     $ f "{r--red text {;y--on yellow--} and more red--}"

    While [;] current is a meta-color refering to the last one on the stack,
    the [d] deafult color referes to terminal's default color, which often is
    different than white color (sometimes equals BRIGHT WHITE [W] color).

    Formatting options work a little bit differently than colors. They are
    xored against current formatting and toggle it. You can thing about it
    like that: odd-numbered formats on stack are active, even numbred are not:
     $ f "{/*--bold, italic {*--bold toggled off--} bold, italic again--}"

    The [#] trim all paddings option removes all leading and trailing
    whitespaces inside the matched balanced pairs:
     $ f "{#--   <no paddings before {r--red--} and no paddings after>    --}"

Remars:
    - Some terminals may lack suport for bright colors (ANSI codes >= 90).
    - Be wary about using non-standard formattings, such as blink, overline,
      double underline and strikethrough.
    - Remember that programs in pipes have system-default buffering, which
      can cause interactive process seem to "freeze" when piped to formatter.
      You can use 'stdbuf' or 'unbuffer' commands to prevent that behavior.
    - The main use case for this program was for pipes and printf-debugging,
      but optional syntax with string arguments was added for convenience.
      Just remember to quote arguments with whitespaces.
)-";

const char* LEGEND = R"-(
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ┏━[ANSI format]━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ┃
┃ ┃  '{format--text--}' e.g. {%Yc*_--foo--}  ┃ ┃
┃ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ┃
┃ ┏━[Colors]━━━━━┳━[Options]━━━━━━━━━━━━━━━━━┓ ┃
┃ ┃              ┃  [c]olor (CAPS == BRIGHT) ┃1┃
┃ ┃  blac[k]     ┃  [%] Reversed             ┃ ┃
┃ ┃  [r]ed       ┃  [!] Blink                ┃2┃
┃ ┃  [g]reen     ┃  [*] Bold                 ┃ ┃
┃ ┃  [y]ellow    ┃  [/] Italic               ┃ ┃
┃ ┃  [b]lue      ┃  [_] Underline            ┃ ┃
┃ ┃  [m]agenta   ┃  [^] Overline             ┃2┃
┃ ┃  [c]yan      ┃  [=] Double underline     ┃2┃
┃ ┃  [w]hite     ┃  [~] Strikethrough        ┃2┃
┃ ┃  [;] current ┃  [.] Dim                  ┃ ┃
┃ ┃  [d] default ┃  [#] Trim text paddings   ┃ ┃
┃ ┃              ┃  [0] Reset all formatting ┃ ┃
┃ ┗━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ┃
┃ ┏━[Control]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ┃
┃1┃  1st encountered color is fg, 2nd is bg  ┃ ┃
┃1┃  Current color [;] is top color on stack ┃ ┃
┃1┃  Capitalize fg/bg for brighter colors    ┃ ┃
┃1┃  Default color [d] is terminal's default ┃ ┃
┃ ┃  Options are toggled (XORed) with last   ┃ ┃
┃ ┃  Empty options '{--' == [0] reset format ┃ ┃
┃ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ┃
┃ ┏━[Remarks]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ┃
┃ ┃  Formats are stored on a stack           ┃ ┃
┃ ┃  It's a greedy stream processor:         ┃ ┃
┃ ┃   - doesn't wait for balanced bracket    ┃ ┃
┃ ┃   - doesn't crash on invalid format      ┃ ┃
┃2┃  Terminals may lack support for some ops ┃ ┃
┃ ┃  Buffering may break interactiveness     ┃ ┃
┃ ┃   - `stdbuf -i0 -o0 formatter` may help  ┃ ┃
┃ ┃  Visit https://bit.ly/2QuLgNo for README ┃ ┃
┃ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
)-";
const char* DEMO = R"-(
┃ {kw--blac[k]     FG--} ┃ {Kw--blac[K]     LFG--} ┃ {;k--blac[k]     BG--} ┃ {;K--blac[K]     LBG--} ┃
┃ {r;--[r]ed       FG--} ┃ {R;--[R]ed       LFG--} ┃ {kr--[r]ed       BG--} ┃ {kR--[R]ed       LBG--} ┃
┃ {g;--[g]reen     FG--} ┃ {G;--[G]reen     LFG--} ┃ {kg--[g]reen     BG--} ┃ {kG--[G]reen     LBG--} ┃
┃ {y;--[y]ellow    FG--} ┃ {Y;--[Y]ellow    LFG--} ┃ {ky--[y]ellow    BG--} ┃ {kY--[Y]ellow    LBG--} ┃
┃ {b;--[b]lue      FG--} ┃ {B;--[B]lue      LFG--} ┃ {kb--[b]lue      BG--} ┃ {kB--[B]lue      LBG--} ┃
┃ {m;--[m]agenta   FG--} ┃ {M;--[M]agenta   LFG--} ┃ {km--[m]agenta   BG--} ┃ {kM--[M]agenta   LBG--} ┃
┃ {c;--[c]yan      FG--} ┃ {C;--[C]yan      LFG--} ┃ {kc--[c]yan      BG--} ┃ {kC--[C]yan      LBG--} ┃
┃ {w;--[w]hite     FG--} ┃ {W;--[W]hite     LFG--} ┃ {kw--[w]hite     BG--} ┃ {kW--[W]hite     LBG--} ┃

┃ {rk--red context       {;w*--[white BG with current FG color and bold]--}      red context--} ┃
┃ {rk--red context       {w;*--[current BG with white FG color and bold]--}      red context--} ┃

┃ {ry--red context       {dd--[default FG+BG color]--}       red context--} ┃

┃ [^] {^--overline                   --} ┃
┃ [_] {_--Underline                  --} ┃
┃ [*] {*--Bold                       --} ┃
┃ [/] {/--Italic                     --} ┃
┃ [.] {.--dim                        --} ┃
┃ [%] {%--reversed                   --} ┃
┃ [!] {!--blink                      --} ┃
┃ [=] {=--double underline           --} ┃
┃ [~] {~--Strikethrough              --} ┃
┃ [0] {0--reset all formatting       --} ┃
┃-{#--
      [#] trim text paddings         
                            --}----------┃

┃ {--common formatting stack test
┃ {--normal {*--bold {/--italic {_--underline {.--dim {%--reverse {~--crossed {!--blink-BLNK--}-CRS--}-RST--}-DIM--}-UND--}-ITA--}-BLD--}-NORM--}
┃ {_--+under{_---under{_--+under--}--}--}

┃ SOME UTF-8:
┃ 你好，世界 
  {%--你好，{*--世界--}--}
┃ ∮ E⋅da = Q,  n → ∞, ∑ f(i) = ∏ g(i), ∀x∈ ℝ : ⌈x⌉ = −⌊−x⌋, α ∧ ¬β = ¬(¬α ∨ β)
  {r--∮ E⋅da = Q,  {b--n → ∞--}, ∑ f(i) = ∏ g(i), {g--∀x∈ ℝ :--} ⌈x⌉ = −⌊−x⌋, α ∧ ¬β = {y--¬({r--¬α ∨ β--})--}--}

┃ -- BELOW IS ONLY RELEVANT WITH -e OPTION --
┃ escape sequences test. If you see [X] then escape doesn't work - it should be [O] ┃
┃ IF YOU SEE THIS MESSAGE, THIS SECTION IS IRRELEVANT\r                                                      
┃ \\\\ bracket escape: \\
┃ \\n newline escape \n^^^^^^^^^^^^^^^^^^^
┃ \\a alert escape (will be heard on supported terminals) \a
┃ \\b backspace escape (moves cursor back 1 char): [X\bO]
┃ \\r: [X] carriage return test (moves cursor back to col 0)\r┃ \\r: [O]
┃ \\f: form feed \\\f\ should be continous diagonal line spanning 2 lines
┃ \\t: horizontal tab: a\tb\tc\td
┃ \\v: vertical tab \\\v\ should be continous diagnoal line spannig 2 lines
)-";


/*
format bitmask:     ┃ valid|0|# ┃ .|~|=|^|_|/|*|!|% ┃          ┃ light bg|bg ┃ light fg|fg ┃
bit widths:     MSB ┃   1  |1|1 ┃ 1|1|1|1|1|1|1|1|1 ┃          ┃    1    | 4 ┃    1    | 4 ┃ LSB
                    ┃  ctrl(3b) ┃    fmt(9b)        ┃ pad(10b) ┃     bg(5b)  ┃     fg(5b)  ┃
*/

typedef __uint32_t mask_t;

enum Masks {
    //-COLOR-MASKS----------
    FG_LIGHT = 0x10 << 0,            // mask light bit of fg
    FG_COLOR = 0x0f << 0,            // mask for color code of fg
    FG_MASK  = FG_LIGHT | FG_COLOR,  // mask for whole FG of
    BG_LIGHT = FG_LIGHT << 5,
    BG_COLOR = FG_COLOR << 5,
    BG_MASK  = BG_LIGHT | BG_COLOR,  // mask for all BG

    BLACK   = 0,  // ANSI color base +0
    RED     = 1,
    GREEN   = 2,
    YELLOW  = 3,
    BLUE    = 4,
    MAGENTA = 5,
    CYAN    = 6,
    WHITE   = 7,

    //-COLOR-SPECIAL--------
    DEFAULT_COLOR = 9,   // 0b1001  default terminal color: ANSI color base +9
    CURRENT_COLOR = 10,  // 0b1010  means that last used color should be used.

    //-FORMAT---------------
    FORMAT_MASK = 0x1ff << 20,

    REVERSED         = 1 << 20,
    BLINK            = 1 << 21,
    BOLD             = 1 << 22,
    ITALIC           = 1 << 23,
    UNDERLINE        = 1 << 24,
    OVERLINE         = 1 << 25,
    DOUBLE_UNDERLINE = 1 << 26,
    STRIKETHROUGH    = 1 << 27,
    DIM              = 1 << 28,

    //-CONTROL--------------
    TRIM  = 1 << 29,
    RESET = 1 << 30,
    VALID = 1 << 31,

    //-SPECIAL-MASKS--------
    INITIAL_FORMAT_MASK = VALID | RESET | DEFAULT_COLOR << 5 | DEFAULT_COLOR,
    EMPTY_FORMAT_MASK   = VALID | CURRENT_COLOR << 5 | CURRENT_COLOR,
};

const string formatChars =
    "krgybmcw"      // 0-7
    "-"             // 8
    "d;"            // 9-10
    "KRGYBMCW"      // 11-18
    "%!*/_^=~.#0";  // 19-29

#define GET_FG(mask) (((mask)&FG_COLOR) >> 0)                                             // returns FG on LSBits
#define GET_BG(mask) (((mask)&BG_COLOR) >> 5)                                             // returns BG on LSBits
#define LIGHTER(color) ((color) | (1 << 4))                                               // returns lighter color mask
#define MASK_TO_FG_ANSI(mask) (GET_FG(mask) + 30 + ((mask)&FG_LIGHT ? 60 : 0))            // returns ANSI code for fg color
#define MASK_TO_BG_ANSI(mask) (GET_BG(mask) + 40 + ((mask)&BG_LIGHT ? 60 : 0))            // returns ANSI code for bg color
#define OVERRIDE(target, submask, source) ((target) & ~(submask) | (source) & (submask))  // returns mask with submask from other
// returns mask with set primary(part=0) or secondary(part!=0) color
inline mask_t WITH_COLOR(mask_t mask, int color, int part) {
    return OVERRIDE(mask, (part == 0 ? FG_MASK : BG_MASK), color | color << 5);
}

class FormatterAutomaton {
    const bool strip    = false;    // should strip instead of printing ANSI
    const bool escape   = false;    // should escape special characters
    const bool sanitize = true;     // should print format reset in destructor

    enum STATE {
        DEFAULT_STATE,
        PARSE_ESCAPE_STATE,
        PARSE_OPENING_BRACKET_STATE,
        SKIP_LEADING_PADDING_STATE,
    } state = DEFAULT_STATE;

    string        store            = "";               // stores current buffered input if processing potential parts
    stack<mask_t> formatStack      = stack<mask_t>();  // mask always describes active formatting (absolute format)
    mask_t        bracketMask      = EMPTY_FORMAT_MASK;
    int           parsedColorParts = 0;

#pragma region innards

    void printANSI(string ANSI) {
        if (!strip)
            printf("%s", ANSI.c_str());
    }

    // converts absolute format mask to ANSI string that can be printed
    string formatToAnsi(mask_t format) {
        assert(format & VALID && format & RESET);

        vector<int> codes;
        // ANSI VALUES
        if (format & RESET) codes.push_back(0);
        if (format & BOLD) codes.push_back(1);
        if (format & DIM) codes.push_back(2);
        if (format & ITALIC) codes.push_back(3);
        if (format & UNDERLINE) codes.push_back(4);
        if (format & BLINK) codes.push_back(6);
        if (format & REVERSED) codes.push_back(7);
        if (format & STRIKETHROUGH) codes.push_back(9);
        if (format & DOUBLE_UNDERLINE) codes.push_back(21);
        if (format & OVERLINE) codes.push_back(53);
        codes.push_back(MASK_TO_FG_ANSI(format));
        codes.push_back(MASK_TO_BG_ANSI(format));
        string ANSI = "";
        for (int code : codes) ANSI += ";" + to_string(code);
        assert(ANSI.size() > 0);
        return "\e[" + ANSI.substr(1) + "m";
    }

    // pushes format on stack and returns built ANSI escape sequence
    string pushFormat(mask_t mask) {
        assert(mask & VALID);

        mask_t format = formatStack.top();

        // 1. calculate the absolute format
        if (mask & RESET) format = INITIAL_FORMAT_MASK;                               // RESET to base off default mask
        format = OVERRIDE(format, TRIM, mask);                                        // trim doesn't propagate through stack
        format ^= mask & FORMAT_MASK;                                                 // toggle the formatting specified in `mask`
        if (GET_FG(mask) != CURRENT_COLOR) format = OVERRIDE(format, FG_MASK, mask);  // override fg color from mask
        if (GET_BG(mask) != CURRENT_COLOR) format = OVERRIDE(format, BG_MASK, mask);  // override bg color from mask

        // 2. store absolute format
        formatStack.push(format);

        // 3. build ansi sequence from absolute mask
        return formatToAnsi(format);
    }

    // pops format from stack and returns built ANSI escape sequence
    string popFormat() {
        if (formatStack.size() > 1) formatStack.pop();
        return formatToAnsi(formatStack.top());  // restore previous format
    }

    inline void storeChar(int c) { store += c; }
    inline void clearStore() { store = ""; }
    inline void flushStore() {
        if (!store.empty()) printf("%s", store.c_str());
        clearStore();
    }

    void cleanAfterBracketParse(bool parseSuccess) {
        parseSuccess ? clearStore() : flushStore();
        parsedColorParts = 0;
        state            = (parseSuccess && (bracketMask & TRIM)) ? SKIP_LEADING_PADDING_STATE : DEFAULT_STATE;
        bracketMask      = EMPTY_FORMAT_MASK;
    }

#pragma endregion

   public:
    // strip: should formatting be parsed to ANSI or stripped off
    FormatterAutomaton(bool strip, bool escape, bool sanitize) 
        : strip(strip), escape(escape), sanitize(sanitize) {
        formatStack.push(INITIAL_FORMAT_MASK);
        printANSI(formatToAnsi(formatStack.top()));
    }

    ~FormatterAutomaton() {
        flushStore();
        if(sanitize)
            printANSI(formatToAnsi(INITIAL_FORMAT_MASK));
    }

    void accept(int c) {
        static size_t found = string::npos;


        // parsing escape
        if (state == PARSE_ESCAPE_STATE) {
            switch (c) {
                case '\\': clearStore(); printf("\\"); break; // backslash
                case 'a' : clearStore(); printf("\a"); break; // alert (bell)
                case 'b' : clearStore(); printf("\b"); break; // backspace
                case 'r' : clearStore(); printf("\r"); break; // carraiage return
                case 'n' : clearStore(); printf("\n"); break; // newline (line feed)
                case 'f' : clearStore(); printf("\f"); break; // form feed
                case 't' : clearStore(); printf("\t"); break; // horizontal tab
                case 'v' : clearStore(); printf("\v"); break; // vertical tab
                default:                                      // invalid escape - print as is
                    storeChar(c);
                    flushStore();
                    break;
            }
            state = DEFAULT_STATE;
        } else if (escape == true && c == '\\') {
            flushStore();
            storeChar(c);  // store = "\"
            state = PARSE_ESCAPE_STATE;
        }


        // potential whitespace trimming - increases memory in TRIM mode
        else if (isspace(c)) {
            if (state != SKIP_LEADING_PADDING_STATE || strip)  // skip whitespace if trim mode
                storeChar(c);

            if (!formatStack.top() & TRIM)  // if trimming mode is not currently enabled, we can safely print the whitespace
                flushStore();
        }


        // begin bracket parsing
        else if (c == '{') {
            flushStore();
            storeChar(c);
            bracketMask = EMPTY_FORMAT_MASK;
            state       = PARSE_OPENING_BRACKET_STATE;
        }


        // parsking end of opening bracket
        else if (c == '-') {
            storeChar(c);
            if (state == PARSE_OPENING_BRACKET_STATE) {
                static regex terminatorRegex("--$");
                if (regex_search(store, terminatorRegex)) {  // success parsing bracket
                    // deal with empty format {--
                    printANSI(pushFormat(bracketMask));
                    return cleanAfterBracketParse(true);
                }
            } else {
                state = DEFAULT_STATE;  // to exit eventual trailing whitespace removal mode
            }
        }


        // parsing options of opening bracket; '-' won't be caught anymore so it's good
        else if (state == PARSE_OPENING_BRACKET_STATE && (found = formatChars.find(c)) != string::npos) {
            storeChar(c);

            // dealing with color
            if (found <= 18) {               // a ';' can be passed here
                if (parsedColorParts < 2) {  // fg, bg not set
                    bracketMask = WITH_COLOR(bracketMask, isupper(c) ? LIGHTER(found - 11) : found, parsedColorParts);
                    ++parsedColorParts;
                } else {  // too much color parts
                    return cleanAfterBracketParse(false);
                }

                // dealing with symbols
            } else {
                mask_t opMask;
                switch (c) {  // todo check if valid
                    case '%': opMask = REVERSED; break;
                    case '!': opMask = BLINK; break;
                    case '*': opMask = BOLD; break;
                    case '/': opMask = ITALIC; break;
                    case '_': opMask = UNDERLINE; break;
                    case '^': opMask = OVERLINE; break;
                    case '=': opMask = DOUBLE_UNDERLINE; break;
                    case '~': opMask = STRIKETHROUGH; break;
                    case '.': opMask = DIM; break;
                    case '#': opMask = TRIM; break;
                    case '0': opMask = RESET; break;
                }
                if (bracketMask & opMask)  // operator was already used
                    return cleanAfterBracketParse(false);
                else
                    bracketMask |= opMask;
            }
        }


        // end the formatting. trippy: {--}
        else if (c == '}') {
            storeChar(c);
            static regex closingBracket(R"(--}$)");
            static regex closingPaddingBracket(R"(\s*--}$)");
            if (regex_search(store, closingBracket)) {
                if (formatStack.size() > 1)  // don't truncate unbalanced pairs
                    store = regex_replace(store,
                                          (formatStack.top() & TRIM) && !strip
                                              ? closingPaddingBracket
                                              : closingBracket,
                                          "");

                flushStore();

                printANSI(popFormat());
                state = DEFAULT_STATE;

            } else {  // some giberrish } in text, continue
                flushStore();
                state = DEFAULT_STATE;
            }
        }


        // any normal characters or breaking current context
        else {
            storeChar(c);
            flushStore();
            state = DEFAULT_STATE;
        }
    }
};

// pushing new formatting on stack introduces ANSI entry sequence
// popping formatting from stack:
//   1. outputs RESET sequence
//   2. introduces stack's top ANSI entry sequence
// thanks to that we can always reset on exit sequences

static int f_strip;
static int f_escape;
static int f_no_sanitize;

static struct option longOptions[] = {
    {"help",        no_argument, NULL,              'h'},
    {"version",     no_argument, NULL,              'v'},
    {"legend",      no_argument, NULL,              'l'},
    {"strip",       no_argument, &f_strip,          's'},
    {"escape",      no_argument, &f_escape,         'e'},
    {"no-sanitize", no_argument, &f_no_sanitize,    'S'},
    {"demo"       , no_argument, NULL,               0 },
    {NULL,          0,           NULL,               0 },
};

int main(int argc, char* argv[]) {

    int opt;    // returned char
    int optIdx; // index in long_options of parsed option
    
    FILE* istream = stdin;
    // parse all options
    // https://azrael.digipen.edu/~mmead/www/Courses/CS180/getopt.html
    while ((opt = getopt_long(argc, argv, "?hvlseS", longOptions, &optIdx)) != -1) {
        switch (opt) {
            case 0:
                if (strcmp(longOptions[optIdx].name, "demo") == 0) {
                    istream = fmemopen((void*)DEMO, strlen(DEMO), "r");   
                    break;
                } else goto unrecognizedLong;
            case 'h': 
                printf(USAGE+1, argv[0]);
                printf("\n%s", HELP + 1);
                exit(EXIT_SUCCESS);
            case 'v': puts("@VER");                             exit(EXIT_SUCCESS);
            case 'l': printf("%s", LEGEND + 1);                 exit(EXIT_SUCCESS);
            case 'e': f_escape = 1; break;
            case 's': f_strip = 1; break;
            case 'S': f_no_sanitize = 1; break;
            case '?': 
                unrecognizedLong:
                fprintf(stderr, USAGE + 1, argv[0]);
                fprintf(stderr, "(try using -h or --help for more info)\n");
                exit(EXIT_FAILURE);
        }
    }

    // read from positional arguments
    if(optind < argc) {
        while (optind < argc) {
            static string separator = "";  // to print arguments separated with spaces
            printf("%s", separator.c_str());

            // parse the argument
            FormatterAutomaton automaton = FormatterAutomaton(f_strip, f_escape, !f_no_sanitize);
            for (char* it = argv[optind]; *it; ++it)  // read null terminated c_string
                automaton.accept(*it);

            separator = " ";
            optind++;
        }
    // read from STDIN
    } else {

        FormatterAutomaton automaton = FormatterAutomaton(f_strip, f_escape, !f_no_sanitize);

        int c;
        while ((c = getc(istream)) != EOF)
            automaton.accept(c);
    }

    exit(EXIT_SUCCESS);
}
