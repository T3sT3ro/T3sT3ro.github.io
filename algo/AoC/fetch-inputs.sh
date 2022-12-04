#!/bin/bash
# Command acquired by: developer tools > network tab > request > copy > copy as cURL
# Cookies can be acquired by clicking lock icon on browser's address bar
# Arguments [optional]:
#  [1st]     - year, default is this year
#  [rest...] - days (use bash substitution like {1..25} to generate range)
# BE AWARE THAT HISTORY CAN REMEMBER COOKIES, SO DON'T DO echo <cookie> > ...

read -rep $'Paste the value of session cookie (just the hash):\n' SESSION_COOKIE

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
echo "Fetching year $YEAR day $i...";
    curl "https://adventofcode.com/$YEAR/day/$i/input" \
    -b "session=$SESSION_COOKIE" \
    -H 'authority: adventofcode.com' \
    -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' \
    -H 'accept-language: pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7' \
    -H 'cache-control: no-cache' \
    -H 'pragma: no-cache' \
    -H "referer: https://adventofcode.com/$YEAR/day/$i" \
    -H 'sec-ch-ua: "Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"' \
    -H 'sec-ch-ua-mobile: ?0' \
    -H 'sec-ch-ua-platform: "Linux"' \
    -H 'sec-fetch-dest: document' \
    -H 'sec-fetch-mode: navigate' \
    -H 'sec-fetch-site: same-origin' \
    -H 'sec-fetch-user: ?1' \
    -H 'upgrade-insecure-requests: 1' \
    -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36' \
    --compressed > $(printf "$YEAR/IN/%02d" $i)
done