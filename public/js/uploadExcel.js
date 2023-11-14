function triggerFileInput() {
  var fileInput = document.getElementById('formFile');

  if (fileInput) {
    fileInput.click();
  }
}

function uploadFile() {
  var fileInput = document.getElementById('formFile');

  if (fileInput.files.length > 0) {
    var form = document.getElementById('fileUploadForm');
    if (form) {
      form.submit();
    }
  }
}