pack: plasplas.user.js
	cd .. ; google-chrome --pack-extension=plasplas/ --pack-extension-key=plasplas.pem
	cp ../plasplas.crx .

clean:
	rm plasplas.crx
