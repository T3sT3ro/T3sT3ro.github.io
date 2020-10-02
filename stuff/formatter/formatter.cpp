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
// TODO fix positional characters to
const char* HELP   = R"-(
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Markdown-like Formatter by Tooster      @SVERSION ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Reads stdin or argument list and writes to        ┃
┃ stdout with ANSI                                  ┃
┃                                                   ┃
┃   usage:  formatter [options] [formats ...]       ┃
┃   options:                                        ┃
┃     -h --help     displays this help              ┃
┃     -v --version  get version string (since v1.4) ┃
┃     -l --legend   show formatting legend          ┃
┃     -s --strip    strip off formatting sequences  ┃
┃     -e --escape   escape sequences (\[\abrnftv])  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
)-";
const char* LEGEND = R"-(
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ┏━[ANSI format]━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ┃
┃ ┃  '{options--text--}' e.g. {%Y*_--foo--}  ┃ ┃
┃ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ┃
┃ ┏━[Colors]━━━━━┳━[Options]━━━━━━━━━━━━━━━━━┓ ┃
┃ ┃  blac[k]     ┃  [c] Set color to c       ┃1┃
┃ ┃  [r]ed       ┃  [%] Reversed             ┃ ┃
┃ ┃  [g]reen     ┃  [!] Blink                ┃2┃
┃ ┃  [y]ellow    ┃  [*] Bold                 ┃ ┃
┃ ┃  [b]lue      ┃  [/] Italic               ┃ ┃
┃ ┃  [m]agenta   ┃  [_] Underline            ┃ ┃
┃ ┃  [c]yan      ┃  [^] Overline             ┃2┃
┃ ┃  [w]hite     ┃  [=] Double underline     ┃2┃
┃ ┃  [;] current ┃  [~] Strikethrough        ┃2┃
┃ ┃  [d] default ┃  [.] Dim                  ┃ ┃
┃ ┃              ┃  [#] Rrim text paddings   ┃ ┃
┃ ┃              ┃  [0] Reset all formatting ┃ ┃
┃ ┗━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ┃
┃ ┏━[Control]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ┃
┃1┃  1st encountered color is fg, 2nd is bg  ┃ ┃
┃1┃  Current(;) color is last color on stack ┃ ┃
┃1┃  Capitalize fg/bg for brighter colors    ┃ ┃
┃1┃  Default color(d) is terminal's default  ┃ ┃
┃ ┃  Options are toggled (XOR) with last     ┃ ┃
┃ ┃  Empty options ({--) resets format (0)   ┃ ┃
┃ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ┃
┃ ┏━[Remarks]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ┃
┃ ┃  Formats are stored on a stack           ┃ ┃
┃ ┃  It's a greedy stream processor:         ┃ ┃
┃ ┃   - doesn't wait for balanced bracket    ┃ ┃
┃ ┃   - doesn't crash on invalid format      ┃ ┃
┃2┃  Terminals may lack support for some ops ┃ ┃
┃ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
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
    const bool strip  = false;  // should strip instead of printing ANSI
    const bool escape = false;  // should escape special characters

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
    FormatterAutomaton(bool strip, bool escape) : strip(strip), escape(escape) {
        formatStack.push(INITIAL_FORMAT_MASK);
        printANSI(formatToAnsi(formatStack.top()));
    }

    ~FormatterAutomaton() {
        flushStore();
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

static struct option longOptions[] = {
    {"help",    no_argument, NULL,  'h'},
    {"version", no_argument, NULL,  'v'},
    {"legend",  no_argument, NULL,  'l'},
    {"strip",   no_argument, NULL,  's'},
    {"escape",  no_argument, NULL,  'e'},
    {NULL,      0,           NULL,   0 },
};

int main(int argc, char* argv[]) {

    static int strip;
    static int escape;

    int opt;    // returned char
    int optIdx; // index in long_options of parsed option

    // parse all options
    while ((opt = getopt_long(argc, argv, "hvlse", longOptions, &optIdx)) != -1) {
        switch (opt) {
            case 'h': printf("%s", HELP + 1);   exit(EXIT_SUCCESS);
            case 'v': printf("@VER\n");         exit(EXIT_SUCCESS);
            case 'l': printf("%s", LEGEND + 1); exit(EXIT_SUCCESS);
            case 's': strip = true; break;
            case 'e': escape = true; break;
            case '?': printf("Unknown option: %c\n", optopt); break;
            default:
                fprintf(stderr, "Usage: %s [-hvlse] [TEXT ...]\n", argv[0]);
                exit(EXIT_FAILURE);
        }
    }

    // non-option arguments
    if(optind < argc) {
        while (optind < argc) {
            static string separator = "";  // to print arguments separated with spaces
            printf("%s", separator.c_str());

            // parse the argument
            FormatterAutomaton automaton = FormatterAutomaton(strip, escape);
            for (char* it = argv[optind]; *it; ++it)  // read null terminated c_string
                automaton.accept(*it);

            separator = " ";
            optind++;
        }
    } else {

        FormatterAutomaton automaton = FormatterAutomaton(strip, escape);

        int c;
        while ((c = getchar()) != EOF)
            automaton.accept(c);
    }
    
    exit(EXIT_SUCCESS);
}