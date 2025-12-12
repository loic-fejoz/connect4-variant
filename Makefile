run:
	npm run dev

build:
	npm run build

connect4-game.xdc:
	npm run build && \
	cd dist && \
	zip -r ../connect4-game.xdc *

.PHONY: connect4-game.xdc run build