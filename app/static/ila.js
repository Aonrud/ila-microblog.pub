import { ImageViewer } from './ila-ui.esm.js';
import Panzoom from './panzoom.es.js';

const iv = new ImageViewer({
	showDownload: true,
	showLink: false,
	panzoom: Panzoom,
	texts: {
		cue: "",
		hide: "",
		download: "",
		prev: "",
		next: "",
		reveal: "",
		revealActive: "",
		link: "",
		zoom: "",
		zoomActive: "",
	},
	icons: {
		cue: "fas fa-plus-circle",
		hide: "fas fa-fw fa-times-circle",
		download: "fas fa-fw fa-download",
		prev: "fas fa-fw fa-chevron-circle-left",
		next: "fas fa-fw fa-chevron-circle-right",
		reveal: "fas fa-fw fa-eye",
		revealActive: "fas fa-fw fa-eye-slash",
		link: "fas fa-fw fa-file-pdf",
		zoom: "fas fa-fw fa-search-plus",
		zoomActive: "fas fa-fw fa-search-minus",
	}
});
iv.create();
