// This code is the intellectual property of Daniel Stephen Herr

var files = []
var stopped = false
const filesinput = document.querySelector("input[multiple]")
const folderinput = document.querySelector("input[directory]")
const filesbutton = document.querySelector("#files")
const folderbutton = document.querySelector("#folder")
const autosave = document.querySelector("#save")
const excludemedia = document.querySelector("#media")
const matchcase = document.querySelector("#case")
const searchinput = document.querySelector("#searchtext")
const defaultsize = searchinput.size
const searchbutton = document.querySelector("#search")
const oldinput = document.querySelector("#oldtext")
const newinput = document.querySelector("#newtext")
const replacebutton = document.querySelector("#replace")
const progress = document.querySelector("progress")
const matcheslist = document.querySelector("ol")
const unmatchedtoggle = document.querySelector("details")
const unmatchedlist = document.querySelector("details ol")

//if(navigator.serviceWorker) {
 //navigator.serviceWorker.register("offline.js").then(function() {
  //if(navigator.serviceWorker.controller == null) {
   //tell("Full functionality is now available offline.")
//} }) }

NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator]

String.prototype.replace = function(oldstring, newstring) {
 return(this.split(oldstring).join(newstring))
}

function not(boolean) {
  return !boolean
}

function controls(enabled) {
  for(var element of document.querySelectorAll("input, button")) {
    element.disabled = not(enabled)
  }
  if(enabled == false) {
    window.addEventListener("keydown", function(event) {
      if(event.keyCode == 27) {
        stopped = true
        window.removeEventListener("keydown", arguments.callee)
      }
    })
  }
}

function proceed(action) {
  if(unmatchedlist.childNodes.length > 0) {
    unmatchedtoggle.style.display = "block"
  }
  progress.value = progress.value + 1
  if(progress.value == progress.max) {
    progress.style.display = "none"
    controls(true)
  }
}

function search(file) {
  var item = document.createElement("li")
  item.textContent = file.relativePath || file.webkitRelativePath || file.name
  if(excludemedia.checked == false || (file.type.includes("audio") == false && file.type.includes("image") == false && file.type.includes("video") == false)) {
    var reader = new FileReader()
    reader.addEventListener("load", function() {
      var result = reader.result
      reader.result = null
      if(matchcase.checked == false) {
        result = result.toLowerCase()
        searchinput.value = searchinput.value.toLowerCase()
      }
      if(result.includes(searchinput.value)) {
        matcheslist.appendChild(item)
      } else {
        unmatchedlist.appendChild(item)
      }
      result = null
      proceed(search)
    })
    reader.readAsText(file)
  } else {
    unmatchedlist.appendChild(item)
    proceed(search)
  }
}

function replace(file) {
  var item = document.createElement("li")
  item.textContent = file.relativePath || file.webkitRelativePath || file.name
  if(excludemedia.checked == false || (file.type.includes("audio") == false && file.type.includes("image") == false && file.type.includes("video") == false)) {
    var reader = new FileReader()
    reader.addEventListener("load", function() {
      var result = reader.result
      reader.result = null
      if(matchcase.checked == false) {
        result = result.toLowerCase()
        oldinput.value = oldinput.value.toLowerCase()
        newinput.value = newinput.value.toLowerCase()
      }
      if(result.includes(oldinput.value)) {
        result = result.replace(oldinput.value, newinput.value)
        var blob = new Blob([result], { type: file.type })
        var url = document.createElement("a")
        url.href = URL.createObjectURL(blob)
        url.download = file.name
        url.textContent = file.relativePath || file.webkitRelativePath || file.name
        item.textContent = ""
        item.appendChild(url)
        matcheslist.appendChild(item)
      } else {
        unmatchedlist.appendChild(item)
      }
      result = null
      proceed(replace)
    })
    reader.readAsText(file)
  } else {
    unmatchedlist.appendChild(item)
    proceed(replace)
  }
}

function addfiles(event) {
  for (var file = 0; file < event.target.files.length; file++) {
    files.push(event.target.files[file])
} }
filesinput.addEventListener("change", addfiles)
folderinput.addEventListener("change", addfiles)

filesbutton.addEventListener("click", function() {
  filesinput.click()
})
folderbutton.addEventListener("click", function() {
  if (folderinput.directory || folderinput.webkitdirectory) {
    folderinput.click()
  } else {
    folderbutton.disabled = true
    ask("Importing folders is only available in Chrome.\nDo you want to get it now?", function(response) {
      if(response) {
        window.open("https://www.google.com/chrome/browser")
      }
    })
  }
})

autosave.addEventListener("click", function() {
  ask("Directly replacing text in the original files is only possible using the Chrome App.\nDo you want to get it now?", function(response) {
    if(response) {
      window.open("https://chrome.google.com/webstore/detail/efoffilfalikcdokjojkliplehkillbd")
    }
    autosave.checked = false
    autosave.disabled = true
  })
})

function inputsize(event) {
  if(event.target.value.length > defaultsize) {
    event.target.size = event.target.value.length
  } else {
    event.target.size = defaultsize
  }
}
searchinput.addEventListener("input", inputsize)
oldinput.addEventListener("input", inputsize)
newinput.addEventListener("input", inputsize)

function start(input, action) {
  if(files.length > 0) {
    if(input.value.length > 0) {
      controls(false)
      matcheslist.innerHTML = null
      unmatchedlist.innerHTML = null
      unmatchedtoggle.style.display = "none"
      progress.style.display = "block"
      progress.value = 0
      progress.max = files.length
      for(var file in files) {
        action(files[file])
      }
    } else {
      tell("You haven't entered any text.")
    }
  } else {
    tell("You haven't selected any files.")
  }
}
searchbutton.addEventListener("click", function() {
  start(searchinput, search)
})
replacebutton.addEventListener("click", function() {
  start(oldinput, replace)
})
