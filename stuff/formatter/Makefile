version = 1.5.5
versionString = $(shell printf '%9s' v$(version))

all: formatter

formatter: formatter.cpp
	sed 's/@SVERSION/$(versionString)/; s/@VER/$(version)/' $^ |\
	 g++ -xc++ -std=c++11 -o $@ -

install: formatter
	cp -iu $^ /usr/local/bin/

demo: formatter demo.txt
	./formatter -e < demo.txt

dist: formatter.cpp Makefile demo.txt README.md
	tar -czf formatter-$(version).tar.gz --transform 's,^,formatter-$(version)/,' \
	 $^

clean:
	rm -rf formatter

distclean: clean
	rm -rf formatter*.tar.gz formatter*/
