		
function base64ToBlob(base64String, contentType = '') {
    const byteCharacters = atob(base64String);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
    }

    const byteArray = new Uint8Array(byteArrays);
    return new Blob([byteArray], { type: contentType });
}

// https://www.tutorialspoint.com/how-to-create-and-save-text-file-in-javascript
const downloadFile = (filename, content) => {
    const link = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });

    link.href = URL.createObjectURL(file);
    link.download = filename;
    link.click();

    URL.revokeObjectURL(link.href);
 };
