#include <cstdio>
#include <unistd.h>

#include <regex>
#include <sstream>
#include <stack>
#include <string>
#include <vector>
#include <cassert>

using namespace std;
// TODO: options to add reset at the beginning or end
// TODO: overlined '^' (53), double underline '=' (23)
const char* HELP = R"-(
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Markdown-like Formatter by Tooster           ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Reads stdin, writes to stdout with ANSI      ┃
┃   usage:  formatter [options]                ┃
┃   options:                                   ┃
┃     -h      displays this help               ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ ┏━[ANSI format]━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ┃
┃ ┃  '{options--text--}' e.g. {%Y:*--foo--}  ┃ ┃
┃ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ┃
┃ ┏━[Colors]━━━━━┳━[Options]━━━━━━━━━━━━━━━━━┓ ┃
┃ ┃  blac[k]     ┃  [%] reversed             ┃ ┃
┃ ┃  [r]ed       ┃  [!] blink                ┃ ┃
┃ ┃  [g]reen     ┃  [*] Bold                 ┃ ┃
┃ ┃  [y]ellow    ┃  [/] Italic               ┃ ┃
┃ ┃  [b]lue      ┃  [_] Underline            ┃ ┃
┃ ┃  [m]agenta   ┃  [^] overline             ┃ ┃
┃ ┃  [c]yan      ┃  [=] double underline     ┃ ┃
┃ ┃  [w]hite     ┃  [~] Strikethrough        ┃ ┃
┃ ┃  [:] current ┃  [.] dim                  ┃ ┃
┃ ┃  [d] default ┃  [fb] set fg/bg colors    ┃ ┃
┃ ┃              ┃  [#] trim text paddings   ┃ ┃
┃ ┃              ┃  [0] reset all formatting ┃ ┃
┃ ┗━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ┃
┃ ┏━[Control]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ┃
┃ ┃  options are toggled AKA XORed           ┃ ┃
┃ ┃  capitalize fg/bg for brighter colors    ┃ ┃
┃ ┃  color control is 2 characters wide      ┃ ┃
┃ ┃  current color is last color on stack    ┃ ┃
┃ ┃  default color is default terminal color ┃ ┃
┃ ┃  empty options insert reset code (0)     ┃ ┃
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
    FORMAT_MASK      = 0x1ff << 20,

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
        "krgybmcw"     // 0-7
        "-"            // 8
        "d:"           // 9-10
        "KRGYBMCW"     // 11-18
        "%!*/_^=~.#0"; // 19-29

#define GET_FG(mask)                        (((mask) & FG_COLOR) >> 0) // returns FG on LSBits
#define GET_BG(mask)                        (((mask) & BG_COLOR) >> 5) // returns BG on LSBits
#define LIGHTER(color)                      ((color) | (1 << 4))       // returns lighter color mask
#define MASK_TO_FG_ANSI(mask)               (GET_FG(mask) + 30 + ((mask) & FG_LIGHT ? 60 : 0)) // returns ANSI code for fg color
#define MASK_TO_BG_ANSI(mask)               (GET_BG(mask) + 40 + ((mask) & BG_LIGHT ? 60 : 0)) // returns ANSI code for bg color
#define OVERRIDE(target, submask, source)   ((target) & ~(submask) | (source) & (submask)) // returns mask with submask from other
// returns mask with set primary(part=0) or secondary(part!=0) color
inline mask_t WITH_COLOR(mask_t mask, int color, int part) {
    return OVERRIDE(mask, (part == 0 ? FG_MASK : BG_MASK), color | color << 5); 
}

class FormatterAutomaton {
public:
    FormatterAutomaton() {
        formatStack.push(INITIAL_FORMAT_MASK);
        printf("%s", formatToAnsi(formatStack.top()).c_str());
    }

private: 
    stack<mask_t> formatStack = stack<mask_t>(); // mask always describes active formatting (absolute format)

    // converts absolute format mask to ANSI string that can be printed
    string formatToAnsi(mask_t format){
        assert(format & VALID && format & RESET);

        vector<int> codes;
        // ANSI VALUES
        if(format & RESET)              codes.push_back(0);
        if(format & BOLD)               codes.push_back(1);
        if(format & DIM)                codes.push_back(2);
        if(format & ITALIC)             codes.push_back(3);
        if(format & UNDERLINE)          codes.push_back(4);
        if(format & BLINK)              codes.push_back(6);
        if(format & REVERSED)           codes.push_back(7);
        if(format & STRIKETHROUGH)      codes.push_back(9);
        if(format & DOUBLE_UNDERLINE)   codes.push_back(21);
        if(format & OVERLINE)           codes.push_back(53);
        codes.push_back(MASK_TO_FG_ANSI(format));
        codes.push_back(MASK_TO_BG_ANSI(format)); 
        string ANSI = "";
        for(int code : codes) ANSI += ";" + to_string(code);
        assert(ANSI.size() > 0);
        return "\e[" + ANSI.substr(1) + "m";
    }

    // pushes format on stack and returns built ANSI escape sequence
    string pushFormat(mask_t mask) {
        assert(mask & VALID);

        mask_t format = formatStack.top();

        // 1. calculate the absolute format
        if (mask & RESET) format = INITIAL_FORMAT_MASK;                                 // RESET to base off default mask
        format = OVERRIDE(format, TRIM, mask);                                          // trim doesn't propagate through stack
        format ^= mask & FORMAT_MASK;                                                   // toggle the formatting specified in `mask`
        if (GET_FG(mask) != CURRENT_COLOR) format = OVERRIDE(format, FG_MASK, mask);    // override fg color from mask
        if (GET_BG(mask) != CURRENT_COLOR) format = OVERRIDE(format, BG_MASK, mask);    // override bg color from mask

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

    #pragma region automaton control

    string store = "";  // stores current buffered input if processing potential parts

    enum STATE {
        DEFAULT_STATE,
        PARSE_OPENING_BRACKET_STATE,
        SKIP_LEADING_PADDING_STATE,
    } state = DEFAULT_STATE;

    inline void storeChar(int c) { store += c; }
    inline void clearStore() { store = ""; }
    inline void flushStore() {
        if (!store.empty()) printf("%s", store.c_str());
        clearStore();
    }
    bool storeContains(string suffix) {
        regex suffixRegex = regex(suffix);
        return regex_search(store, suffixRegex);
    }

#pragma endregion


    mask_t bracketMask      = EMPTY_FORMAT_MASK;
    int    parsedColorParts = 0;
    size_t found            = string::npos;
    void   cleanAfterBracketParse(bool parseSuccess) {
        parseSuccess ? clearStore() : flushStore();
        parsedColorParts = 0;
        state = (parseSuccess && (bracketMask & TRIM)) ? SKIP_LEADING_PADDING_STATE : DEFAULT_STATE;
        bracketMask = EMPTY_FORMAT_MASK;
    }


    


   public:
    void accept(int c) {

        // whitespace trimming
        if (isspace(c)) {
            if(state != SKIP_LEADING_PADDING_STATE)
                storeChar(c);
        }


        // begin bracket parsing
        else if(c == '{'){

            flushStore();
            storeChar(c);
            bracketMask = EMPTY_FORMAT_MASK;
            state = PARSE_OPENING_BRACKET_STATE;
        } 


        // TODO: everything
        else if (c == '-') {
            
            storeChar(c);
            if(state == PARSE_OPENING_BRACKET_STATE){
                if (parsedColorParts == 1) {        // color not fully parsed
                    return cleanAfterBracketParse(false);
                } else if (storeContains("--$")) {  // success parsing bracket
                    // deal with empty format {--
                    // fprintf(stderr, "[#:%x]\n", bracketMask);
                    auto ansi = pushFormat(bracketMask);
                    printf("%s", ansi.c_str());
                    return cleanAfterBracketParse(true);
                }
            } else {
                state = DEFAULT_STATE; // to exit eventual trailing whitespace removal mode
            }
        } 
        

        // parsing options of opening bracket; '-' won't be caught anymore so it's good
        else if (state == PARSE_OPENING_BRACKET_STATE && (found = formatChars.find(c)) != string::npos) {
            // valid formatting has at most one option of each kind

            storeChar(c);

            // dealing with color
            if (found <= 18) { // a ':' can be passed here
                if (parsedColorParts < 2)           // fg, bg not set
                    bracketMask = WITH_COLOR(bracketMask, isupper(c) ? LIGHTER(found - 11) : found, parsedColorParts++);
                else { 
                    return cleanAfterBracketParse(false);
                }
                
            // dealing with symbols
            } else if(parsedColorParts == 1){       
                return cleanAfterBracketParse(false);

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
                if(bracketMask & opMask) // operator was already used
                    return cleanAfterBracketParse(false);
                else
                    bracketMask |= opMask;
            }
        } 

        
        // end the formatting. trippy: {--}
        else if (c == '}') {

            storeChar(c);
            if(storeContains("--}$")) {
                if(formatStack.size() > 1) // don't truncate unbalanced pairs
                    store = regex_replace(store, regex(formatStack.top() & TRIM ? R"(\s*--}$)" : R"(--}$)"), "");

                flushStore(); // but it should be empty IMHO |

                auto ansi = popFormat();
                printf("%s", ansi.c_str());
                state = DEFAULT_STATE;

            } else { // some giberrish } in text, continue
                flushStore();
                state = DEFAULT_STATE;
            }
        } 
              

        else { // done
            storeChar(c);
            flushStore();
            state = DEFAULT_STATE;
        }

// when not to flush:
//  c is {
//  c is - and store ends in _, _-
//  c is - and store ends in -  without TRIM mode
//  c is } and store ends in --
    }

    ~FormatterAutomaton() {
        flushStore();
        printf("%s", formatToAnsi(INITIAL_FORMAT_MASK).c_str());
    }
};

// pushing new formatting on stack introduces ANSI entry sequence
// popping formatting from stack:
//   1. outputs RESET sequence
//   2. introduces stack's top ANSI entry sequence
// thanks to that we can always reset on exit sequences

void linearProcessText() {
    FormatterAutomaton automaton = FormatterAutomaton();

    int c;
    while ((c = getchar()) != EOF) 
        automaton.accept(c);
}

int main(int argc, char* argv[]) {
    while(optind < argc){

        int opt;
        if ((opt = getopt(argc, argv, "h")) != -1) {
            switch (opt) {
                case 'h': 
                    printf("%s", HELP + 1); 
                    exit(EXIT_SUCCESS);
                default:
                usage:
                    fprintf(stderr, "Usage: %s [-h]\n", argv[0]);
                    exit(EXIT_FAILURE);
            }

        } else {
            // regular argument
            goto usage;
            optind++;
        }
    }
    linearProcessText();
}

// {::*--testing--}