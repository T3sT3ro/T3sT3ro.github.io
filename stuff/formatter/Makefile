VERINFO = formatter.ver
CPP = formatter.cpp
TARFILES = $(CPP) Makefile demo.txt README.md $(VERINFO)

version = $(file < ${VERINFO})
versionString = v$(version)


all: formatter

formatter: $(CPP) $(VERINFO)
	sed 's/@SVERSION/$(versionString)/; s/@VER/$(version)/' $(CPP) |\
	 g++ -xc++ -std=c++11 -o $@ -

install: formatter
	cp -iu $^ /usr/local/bin/

demo: formatter demo.txt
	./formatter -e < demo.txt

clean:
	rm -rf formatter

distclean: clean
	rm -rf formatter*.tar.gz formatter*/


dist: distclean $(TARFILES)
	tar -czf formatter-$(version).tar.gz --transform 's,^,formatter-$(version)/,' \
	 $(TARFILES)
