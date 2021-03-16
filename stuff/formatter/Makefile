version = 1.5.6
versionString = $(shell printf '%9s' v$(version))

all: formatter

formatter: formatter.cpp
	sed 's/@SVERSION/$(versionString)/; s/@VER/$(version)/' $^ |\
	 g++ -xc++ -std=c++11 -o $@ -

install: formatter
	cp -iu $^ /usr/local/bin/

demo: formatter demo.txt
	./formatter -e < demo.txt

clean:
	rm -rf formatter

distclean: clean
	rm -rf formatter*.tar.gz formatter*/

TARFILES = formatter.cpp Makefile demo.txt README.md

dist: distclean $(TARFILES)
	make distclean
	tar -czf formatter-$(version).tar.gz --transform 's,^,formatter-$(version)/,' \
	 $(TARFILES)
