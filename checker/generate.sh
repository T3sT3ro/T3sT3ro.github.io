SEED=$RANDOM
SMALL_A=1
SMALL_B=10
MEDIUM_A=100
MEDIUM_B=1000
BIG_A=10000
BIG_B=100000



echo -e "\033[1;33m GENERATING TEST :\033[0m"

# if directories doesn't exist, create them
mkdir -p tests

# make generator
echo -ne "\033[0;36m  ~Recompiling generator with c++11...  \033[0m"
if ! g++ -std=c++11 -O3 generator.cpp -o generator; then 
	exit
fi
echo -e "\033[0;36mDone.\033[0m"


for i in {01..20}; do
	echo -ne "  generating: test_$i \r"
	if ! ./generator <<< "$SEED $SMALL_A $SMALL_B" > tests/test_$i; then exit; fi;
done

for i in {21..40}; do
	echo -ne "  generating: test_$i \r"
	if ! ./generator <<< "$SEED $MEDIUM_A $MEDIUM_B" > tests/test_$i; then exit; fi;
done

for i in {41..60}; do
	echo -ne "  generating: test_$i \r"
	if ! ./generator <<< "$SEED $BIG_A $BIG_B" > tests/test_$i; then exit; fi;
done


echo -ne "\033[1;33m\n TESTS GENERATED\n\033[0m"

rm -f "generator.exe"