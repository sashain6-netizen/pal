let currentTab = null;

function newTab(url="https://google.com"){
  const browser = document.getElementById("browser");

  const view = document.createElement("webview");
  view.src = url;

  browser.innerHTML="";
  browser.appendChild(view);

  currentTab = view;
}

function go(){
  const url = document.getElementById("url").value;
  currentTab.src = url;
}

function goBack(){
  if(currentTab.canGoBack())
    currentTab.goBack();
}

function goForward(){
  if(currentTab.canGoForward())
    currentTab.goForward();
}

window.onload = () => {
  newTab();
}