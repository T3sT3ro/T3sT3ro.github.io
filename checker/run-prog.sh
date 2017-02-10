echo -e "\033[1;33m RUNNING PROGRAM ON TESTS\033[0m"
echo -ne "\033[0;36m  ~Recompiling program with c++11...    \033[0m"
if ! g++ -std=c++11 -O3 prog.cpp -o prog; then 
	echo -e "\033[0;31m ! COMPILATION ERROR in prog.cpp\033[0m"
	exit
fi
echo -e "\033[0;36mDone.\033[0m"
mkdir -p out_prog/

for f in tests/*; do
	echo -ne "  running: $(basename $f) \r"
	if ! ./prog < "tests/$(basename $f)" > "out_prog/$(basename $f)"; then 
		echo -ne "\033[0;31m ! RUNTIME ERROR in prog.cpp: $(basename $f)\n\n\033[0m"
	fi
done
echo -ne "\033[1;33m\n PROGRAM GENERATED OUTS\n\033[0m"

rm -f "prog.exe"