version = v1.4

all: formatter

formatter: formatter.cpp
	sed s/@VER/$(version)/ formatter.cpp |\
	 g++ -xc++ -std=c++11 -o formatter -

install: formatter
	cp -iu formatter /usr/local/bin/

demo: formatter demo.txt
	./formatter < demo.txt

dist: formatter.cpp demo.txt Makefile README.md
	tar -czf formatter-$(version).tar.gz --transform 's,^,formatter-$(version)/,' \
	 formatter.cpp Makefile demo.txt README.md

clean:
	rm -rf formatter
	rm -rf formatter*.tar.gz formatter*/
