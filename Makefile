.PHONY: package
package: hacker-news-visual-rank.zip 

hacker-news-visual-rank.zip: icon*.png manifest.json script.js
	zip $@ $^