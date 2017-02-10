echo -e "\033[1;33m COMPARING ANSWERS\033[0m"

for f in tests/*; do
	echo -ne "  checking: $(basename $f) \r"
	if ! diff -w "out_prog/$(basename $f)" "out_correct/$(basename $f)" >/dev/null 2>&1
	then
		echo -e "\033[0;31m ! WRONG ANSWER: $f\033[0m"
	fi
done
echo -e "\033[1;33m TESTS COMPARED\033[0m\n"