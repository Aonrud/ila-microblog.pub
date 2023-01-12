// The new post textarea
const ta = document.getElementsByName("content")[0];
// Helper for inserting text (emojis) in the textarea
function insertAtCursor (textToInsert) {
    ta.focus();
    const isSuccess = document.execCommand("insertText", false, textToInsert);

    // Firefox (non-standard method)
    if (!isSuccess) {
        // Credits to https://www.everythingfrontend.com/posts/insert-text-into-textarea-at-cursor-position.html
        // get current text of the input
        const value = ta.value;
        // save selection start and end position
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        // update the value with our text inserted
        ta.value = value.slice(0, start) + textToInsert + value.slice(end);
        // update cursor to be at the end of insertion
        ta.selectionStart = ta.selectionEnd = start + textToInsert.length;
    }
}
// Emoji click callback func
let ji = function (ev) {
    insertAtCursor(ev.target.attributes.alt.value + " ");
    ta.focus()
}

// Enable the click for each emojis
let items = document.getElementsByClassName("ji")
for (let i = 0; i < items.length; i++) {
    items[i].addEventListener('click', ji);
}

// Add new input text dynamically to allow setting an alt text on attachments
let files = document.getElementById("files");
let alts = document.getElementById("alts");
files.addEventListener("change", function(e) {
    // Reset the div content
    alts.innerHTML = "";

    // Add an input for each files
    for (let i = 0; i < e.target.files.length; i++) {
        const p = document.createElement("p");
        
        const label = document.createElement("label");
        label.textContent = "Alt text (" + e.target.files[i].name + ")";
        p.appendChild(label);
        
        const altEl = document.createElement("textarea");
        altEl.setAttribute("name", "alt_" + e.target.files[i].name);
        altEl.setAttribute("placeholder", "Alt text for " + e.target.files[i].name);
        altEl.classList.add("form-control");
        p.appendChild(altEl);
        
        alts.appendChild(p);
    }
});
// Focus at the end of the textarea
const end = ta.value.length;
ta.setSelectionRange(end, end);
ta.focus();
