all: formatter

formattter: 
	g++     formatter.cpp   -o formatter

install: formatter
	cp -iu formatter /usr/local/bin/

demo: formatter demo.txt
	./formatter < demo.txt

clean:
	rm -f formatter
