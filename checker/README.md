
	CHECKER
		by Tooster
		
	1. put your program in prog.cpp
	2. put brute in brute.cpp
	3. put test generator in generator.cpp
	    generator.cpp should take 3 arguments:
			- SEED = random seed,
			- A = bottom limit,
			- B = upper limit
		to generate random tests with varying parameters, for example numbers from A to B
		modify variables SMALL_A, SMALL_B and so on to your need.
	4. to run everything from scratch simply execute ./CHECKER.sh
	   errors will be usually printed in red
	
	
	If you have tests and don't want to generate them again, execute ./run.sh
	
	You can run each goal separately. Here is the tree of executions
	
	CHECKER.sh ───► generate.sh ───► run.sh
	    |               |              └───────► ./tests-format.sh ───► ./run-prog.sh ───► ./run-brute.sh ───► ./test.sh
		|               |              |                 |                    |                  |                 |
   main program   generates tests      |                 |                    |                  |                 |
                  by generator.cpp   makes      formats all external    generates outs     generates outs     compares outs 
				                    outputs     tests and outs in       from prog.cpp      from brute.cpp     in out_correct/
									            tests/ & out_correct/   in out_prog/       in out_correct/    and out_prog/
												to erase 'in' 'out'
												
												
	This is it. Nothing complicated
	If you have only program, brute and generator you use ./CHECKER.sh
	If you have test cases but no answers you use ./run.sh
	If you have test cases and answers you use ./tests-format.sh ./run-prog.sh ./test.sh
	If you only want test cases for now you use ./generate.sh
	
	Simple right ? :)
	Have fun with this machinery ^^