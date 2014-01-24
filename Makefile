pack: plasplas.user.js
	mkdir plasplas
	cp jquery-1.10.2.min.js plasplas/
	cp manifest.json plasplas/
	cp plasplas.user.js plasplas/ 
	cd .. ; google-chrome --pack-extension=plasplas/plasplas --pack-extension-key=plasplas.pem
	rm -r plasplas

clean:
	rm plasplas.crx
