TESTS=20

echo " GENERATING TEST :"

# if directories doesn't exist, create them
mkdir -p tests_small/
mkdir -p tests_medium/
mkdir -p tests_big/

# if make generator
echo -n "  Recompiling generator with c++11...  "
if ! g++ -std=c++11 -O3 generator.cpp -o generator
then 
	exit
fi
echo "Done."

#
# SMALL
#

echo -n "  Generating small tests...            "
for (( i=1; i<=TESTS; i++ ))
do
	./generator <<< "$RANDOM 1 10" > tests_small/small_$i.in
done
echo "Done."

#
# MEDIUM
#

echo -n "  Generating medium tests...           "
for (( i=1; i<=TESTS; i++ ))
do
	./generator <<< "$RANDOM 100 1000" > tests_medium/medium_$i.in
done
echo "Done."

#
# BIG
#

echo -n "  Generating big tests...              "
for (( i=1; i<=TESTS; i++ ))
do
	./generator <<< "$RANDOM 10000 100000" > tests_big/big_$i.in
done
echo "Done."
echo " TESTS GENERATED"
echo ""
