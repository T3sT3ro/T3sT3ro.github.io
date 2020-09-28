version = v1.5

all: formatter

formatter: formatter.cpp
	sed s/@VER/$(version)/ formatter.cpp |\
	 g++ -xc++ -std=c++11 -o formatter -

install: formatter
	cp -iu formatter /usr/local/bin/

demo: formatter demo.txt
	./formatter -e < demo.txt

dist: formatter.cpp Makefile demo.txt README.md
	tar -czf formatter-$(version).tar.gz --transform 's,^,formatter-$(version)/,' \
	 formatter.cpp Makefile demo.txt README.md

clean:
	rm -rf formatter

distclean: clean
	rm -rf formatter*.tar.gz formatter*/
