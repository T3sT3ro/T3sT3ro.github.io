TESTS=20
ALLOK=true

echo " RUNNING TESTS"
echo -n "  Recompiling program with c++11...    "
if ! g++ -std=c++11 -O3 prog.cpp -o prog
then 
	echo ""
	echo "COMP_ERR in prog.cpp"
	exit
fi
echo "Done."
echo -n "  Recompiling brute with c++11...      "
if ! g++ -std=c++11 -O3 brute.cpp -o brute
then 
	echo ""
	echo "COMP_ERR in brute.cpp"
	exit
fi
echo "Done."

mkdir -p out_brute/
mkdir -p out_prog/

#
# SMALL
#

echo "  # SMALL TESTS"
for (( i=1; i<=TESTS; i++))
do
	if ! ./prog < "tests_small/small_$i.in" > "out_prog/small_$i.out"
	then 
		echo "RUN_ERR in prog.cpp: small_$i"
		exit
	fi
	if ! ./brute < "tests_small/small_$i.in" > "out_brute/small_$i.out"
		then 
		echo "RUN_ERR in brute.cpp: small_$i"
		exit
	fi
	if ! cmp "out_prog/small_$i.out" "out_brute/small_$i.out" >/dev/null 2>&1
	then
		echo "     ERR: small_$i"
		ALLOK=false
	fi
done

#
# MEDIUM
#

echo "  # MEDIUM TESTS"
for (( i=1; i<=TESTS; i++))
do
	if ! ./prog < "tests_medium/medium_$i.in" > "out_prog/medium_$i.out"
		then 
		echo "RUN_ERR in prog.cpp: medium_$i"
		exit
	fi
	if ! ./brute < "tests_medium/medium_$i.in" > "out_brute/medium_$i.out"
		then 
		echo "RUN_ERR in brute.cpp: medium_$i"
		exit
	fi
	if ! cmp "out_prog/medium_$i.out" "out_brute/medium_$i.out" >/dev/null 2>&1
	then
		echo "     ERR: medium_$i"
		ALLOK=false
	fi
done

#
# BIG
#
echo "  # BIG TESTS"
for (( i=1; i<=TESTS; i++))
do
	if ! ./prog < "tests_big/big_$i.in" > "out_prog/big_$i.out"
		then 
		echo "RUN_ERR in prog.cpp: big_$i"
		exit
	fi
	if ! ./brute < "tests_big/big_$i.in" > "out_brute/big_$i.out"
		then 
		echo "RUN_ERR in brute.cpp: big_$i"
		exit
	fi
	if ! cmp "out_prog/big_$i.out" "out_brute/big_$i.out" >/dev/null 2>&1
	then
		echo "     ERR: big_$i"
		ALLOK=false
	fi
done
echo " DONE"
echo ""

if $ALLOK 
then
	echo "All tests passed."
else
	echo "Some errors occured."
fi