VERINFO = formatter.ver
CPP = formatter.cpp
TARFILES = $(CPP) Makefile README.md $(VERINFO)

version = $(file < ${VERINFO})
nextversion = $(shell semver -i ${version})
versionString = v$(version)


all: formatter

formatter: $(CPP) $(VERINFO)
	sed 's/@SVERSION/$(versionString)/; s/@VER/$(version)/' $(CPP) |\
	 g++ -xc++ -std=c++11 -o $@ -

install: formatter
	sudo cp -iu $^ /usr/local/bin/

install-clean: install clean

clean:
	rm -rf formatter

distclean: clean
	rm -rf formatter*.tar.gz formatter*/


dist: distclean $(TARFILES)
	tar -czf formatter-$(version).tar.gz --transform 's,^,formatter-$(version)/,' \
	 $(TARFILES)

.PHONY: bump
bump: formatter.ver
	echo $(nextversion) > $(VERINFO)
	@echo "BUMPED $(version) --> $(nextversion)"
