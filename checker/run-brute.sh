echo -e "\033[1;33m RUNNING BRUTE ON TESTS\033[0m"
echo -ne "\033[0;36m  ~Recompiling brute with c++11...      \033[0m"
if ! g++ -std=c++11 -O3 brute.cpp -o brute; then 
	echo -e " ! COMPILATION ERROR in brute.cpp"
	exit
fi
echo -e "\033[0;36mDone.\033[0m"
mkdir -p out_correct/

for f in tests/*; do
	echo -ne " >running: $(basename $f) \r"
	if ! ./brute < "tests/$(basename $f)" > "out_correct/$(basename $f)"; then 
		echo -ne " ! RUNTIME ERROR in brute.cpp: $(basename $f)\n\n"
	fi
done
echo -ne "\033[1;33m\n BRUTE GENERATED OUTS\n\033[0m"

rm -f "brute.exe"