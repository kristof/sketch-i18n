var com = {};

com.translate = {

	debugLog: function(msg) {
		if(this.debug) log(msg);
	},

	alert: function (msg, title) {
		title = title || 'Sketch translate';
		var app = [NSApplication sharedApplication];
		[app displayDialog:msg withTitle:title];
	},

	getTextLayersForPage: function(page) {
		var layers = [page children],
				textLayers = [];

		for (var i = 0; i < layers.count(); i++) {
			var layer = [layers objectAtIndex:i];
			if (this.isTextLayer(layer)) {
				textLayers.push(layer);
			}
		}

		return textLayers;
	},

	isTextLayer: function(layer) {
		if (layer.class() === MSTextLayer) {
			return true;
		}
		return false;
	},

	localeStringFromTextLayers: function(textLayers) {
		var localeObject = {};

		for (var i = 0; i < textLayers.length; i++) {
			var textLayer = textLayers[i],
					stringValue = unescape(textLayer.stringValue());

			localeObject[stringValue] = stringValue;
		}

		var localeJsonString = JSON.stringify(localeObject, undefined, 2);

		return localeJsonString;
	},

	generateLocaleForPage: function(page) {
		var textLayers = this.getTextLayersForPage(page);
		return this.localeStringFromTextLayers(textLayers);
	},

	generateLocaleForCurrentPage: function() {
		var currentPage = [doc currentPage];
		return this.generateLocaleForPage(currentPage);
	},

	copyStringToClipboard: function(string) {
		var clipboard = NSPasteboard.generalPasteboard();
		clipboard.declareTypes_owner([NSPasteboardTypeString], null);
		clipboard.setString_forType(string , NSPasteboardTypeString);
		this.alert('The translation file has been copied to your clipboard, paste it in your favorite editor and save it as a *.json file for example \'en-US.json\'.\n\nWhen you are ready to import your changes run \'2. Translate page\' and pick your json file that contains the translations.', null);
		return true;
	},
	
	translatePageWithData: function(page, language, data) {		
		var pageName = [page name],
				page = [page copy]
				page.setName(pageName + ': ' + language),
				textLayers = this.getTextLayersForPage(page),
				errorCount = 0;
				
		[[doc documentData] addPage:page];
		
		for (var i = 0; i < textLayers.length; i++) {
			var textLayer = textLayers[i],
					stringValue = unescape(textLayer.stringValue());
			if(data[stringValue]){
				textLayer.setStringValue(data[stringValue]);
				[textLayer adjustFrameToFit];
			}else{
				errorCount++;
			}
		}
		
		[doc setCurrentPage:page];
		
		return errorCount;
	},
	
	translatePageWithFilePicker: function(page) {
		var openPanel = [NSOpenPanel openPanel];
		
		var defaultDirectory = [NSURL fileURLWithPath:"~/Documents/"];
		if([doc fileURL]) {
			defaultDirectory = [[doc fileURL] URLByDeletingLastPathComponent]]
		}
		
		[openPanel setCanChooseDirectories:true];
		[openPanel setCanChooseFiles:true];
		[openPanel setAllowedFileTypes:['json']];
		[openPanel setCanCreateDirectories:false];
		[openPanel setDirectoryURL:defaultDirectory];
		
		[openPanel setTitle:"Pick a translation file"];
		[openPanel setPrompt:"Translate"];
		
		if ([openPanel runModal] == NSOKButton) {
			var url = [openPanel URL],
					filename = [[url lastPathComponent] stringByDeletingPathExtension],
					getString = NSString.stringWithContentsOfFile_encoding_error(url, NSUTF8StringEncoding, null);
			
			if(getString){
				data = JSON.parse(getString.toString());
				var errorCount = this.translatePageWithData(page, filename, data);
				if (errorCount > 0){
					this.alert('Translation completed with ' + errorCount + ' errors.', null);
				}else{
					this.alert('Translation completed successfully', null);
				}
			}
		}
		
		return true;
	},

	debug: true

};