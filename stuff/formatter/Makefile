VERFILE = VERSION
CPP = formatter.cpp
TARFILES = $(CPP) Makefile README.md $(VERFILE)
HOMEPAGE = https://t3st3ro.github.io/packages/formatter/

VER_CURRENT = $(file < ${VERFILE})
VER_NEXT = $(shell semver -i ${VER_CURRENT})
VER_STR = v$(VER_CURRENT)


formatter: $(CPP) $(VERFILE)
	sed 's/@SVERSION/$(VER_STR)/; s/@VER/$(VER_CURRENT)/' $(CPP) |\
    sed 's#@HOMEPAGE#$(HOMEPAGE)#' |\
	 g++ -xc++ -std=c++11 -o $@ -

install: formatter
	sudo cp -u $^ /usr/local/bin/

clean:
	rm -rf formatter

distclean: clean
	rm -rf formatter*.tar.gz formatter*/

.dist: distclean $(TARFILES)
	tar -czf formatter-$(VER_CURRENT).tar.gz --transform 's,^,formatter-$(VER_CURRENT)/,' \
	 $(TARFILES)

.PHONY: .bump
.bump: $(VERFILE)
	echo $(VER_NEXT) > $(VERFILE)
	@echo "BUMPED $(VER_CURRENT) --> $(VER_NEXT)"


publish: .bump install .dist
