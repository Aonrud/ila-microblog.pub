import { ImageViewer } from './ila-ui.esm.js';

const iv = new ImageViewer({
	showDownload: true,
	showLink: false,
	texts: {
		cue: "",
		hide: "",
		download: "",
		prev: "",
		next: "",
		link: "",
		zoom: "",
		zoomActive: "",
	},
	icons: {
		cue: "fas fa-plus-circle",
		hide: "fas fa-fw fa-times-circle",
		download: "fas fa-fw fa-download",
		prev: "fas fa-fw fa-chevron-circle-left",
		next: "fa fa-fw fa-chevron-circle-right",
		link: "fas fa-fw fa-file-pdf",
		zoom: "fas fa-fw fa-search-plus",
		zoomActive: "fas fa-fw fa-search-minus",
	}
});
iv.create();
