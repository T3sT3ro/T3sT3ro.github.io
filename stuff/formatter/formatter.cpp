#include <stdio.h>
#include <string.h>

#include <stack>

using namespace std;

const char* HELP = 
"┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n"
"┃ Formatter by Tooster                         ┃\n"
"┃   usage: formatter <format>             ┃\n"
"┃   Format looks like this: [operators-<text>-]             ┃\n"
"┣━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━┫\n"
"┣━[Colors]━━━━━━╋━[Options]━━━━━━━━━━━━━━━━━━┫ ┃\n"
"┃   blac[k]     ┃   [%] reversed             ┃ ┃\n"
"┃   [r]ed       ┃   [!] blink                ┃ ┃\n"
"┃   [g]reen     ┃   [*] Bold                 ┃ ┃\n"
"┃   [y]ellow    ┃   [/] Italic               ┃ ┃\n"
"┃   [b]lue      ┃   [_] Underline            ┃ ┃\n"
"┃   [m]agenta   ┃   [~] Strikethrough        ┃ ┃\n"
"┃   [c]yan      ┃   [.] dim                  ┃ ┃\n"
"┃   [w]hite     ┃   [0] reset all formatting ┃ ┃\n"
"┃   [:] current ┃                            ┃ ┃\n"
"┣━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫ ┃\n"
"┃━[Control]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫ ┃\n"
"┃   [F>] don't terminate format F            ┃ ┃\n"
"┃   [<F] only terminate format F             ┃ ┃\n"
"┃   [C^] use brighter color C (+60)          ┃ ┃\n"
"┃   [::] set foreground color C              ┃ ┃\n"
"┃   [bC] set background color C              ┃ ┃\n"
"┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━┛\n";

int main(int argc, char const *argv[]) {
    printf("%s", ;
    if (!strcmp(argv[0], "-?")){
    }
    return 0;
}


// [[y:*{something [[_*/]]{another something} something}