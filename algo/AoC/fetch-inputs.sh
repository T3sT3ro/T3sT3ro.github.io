#!/bin/bash
# Command acquired by: developer tools > network tab > request > copy > copy as cURL
# Cookies can be acquired by clicking lock icon on browser's address bar
# reads session.cookie
# Arguments [optional]:
#  [1st]     - year, default is this year
#  [rest...] - days (use bash substitution like {1..25} to generate range)
# BE AWARE THAT HISTORY CAN REMEMBER COOKIES, SO DON'T DO echo <cookie> > ...

COOKIEFILE=aoc-session.cookie
if [ -e $COOKIEFILE ]; then
    echo "using cookie file: $COOKIEFILE" >&2
    SESSION_COOKIE=$(cat $COOKIEFILE)
else
    echo "reading from STDIN: $COOKIEFILE" >&2
    read -rep $'Paste the value of session cookie (just the hash):\n' SESSION_COOKIE
fi

if [[ -z $SESSION_COOKIE ]]; then
    echo "session cookie not specified" >&2
    exit 1;
fi;

YEAR=${1:-`date +%Y`}
shift
mkdir -p "$YEAR/IN"
DAYS=${@:-`date +%-d`} # today if not specified
# START=${2:-`date +%-d`}
# END=${3:-`if [[ -z "$2" ]]; then echo $START; else echo 25; fi`}

for i in $DAYS; do
    
    FILEBASENAME=$(printf "%02d" $i)
    
    echo "Fetching year $YEAR day $i...";
    curl "https://adventofcode.com/$YEAR/day/$i/input" \
    -b "session=$SESSION_COOKIE" \
    -H 'authority: adventofcode.com' \
    -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' \
    -H 'accept-language: pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7' \
    -H 'cache-control: no-cache' \
    -H 'pragma: no-cache' \
    -H "referer: https://adventofcode.com/$YEAR/day/$i/dupa" \
    -H 'sec-ch-ua: "Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"' \
    -H 'sec-ch-ua-mobile: ?0' \
    -H 'sec-ch-ua-platform: "Linux"' \
    -H 'sec-fetch-dest: document' \
    -H 'sec-fetch-mode: navigate' \
    -H 'sec-fetch-site: same-origin' \
    -H 'sec-fetch-user: ?1' \
    -H 'upgrade-insecure-requests: 1' \
    -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36' \
    --compressed -o "$YEAR/IN/$FILEBASENAME" \
    -w "status: %{http_code} size: %{size_download}B file: %{filename_effective} from: %{url} took: %{time_total}sec" \
    -sS
    #2>/dev/null
    
    SOLUTION="$YEAR/$FILEBASENAME.js"
    if [[ ! -f $SOLUTION ]]; then
        echo "programm missing, creating template..."
        echo "\
\$ = require('../in.js');
_ = require('lodash');
t = \$('IN/$FILEBASENAME').textContent.trim().split('\n');" > $SOLUTION
    fi
done
